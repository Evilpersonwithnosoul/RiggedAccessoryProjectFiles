var Dress : RiggedAccessoryAttacher;
var Victim : VictimScript;

var MyController : CharacterController;
var Character : GameObject;
var DarkHair : GameObject;
var TsunHair : GameObject;

var Spine : Transform;

var MyRenderer : SkinnedMeshRenderer;
var NoTorsoMesh : Mesh;
var BaldMesh : Mesh;
var PonyMesh : Mesh;

var DarkHairTexture : Texture;
var TsunHairTexture : Texture;

var DarkUniform : Texture;
var TsunUniform : Texture;
var Nude : Texture;

var ArmColliders : Collider[];

var PerformingPairedAnim = false;

var TsunIdleAnimName = "";
var PairedAnimName = "";
var IdleAnimName = "";
var WalkAnimName = "";
var RunAnimName = "";

var WalkSpeed = 0.0;
var RunSpeed = 0.0;
var MaxSpeed = 0.0;

var Angle = 0.0;
var Timer = 0.0;

function Start()
{
	BecomeYandere();
}

function Update()
{
	MyController.Move(Physics.gravity * 0.1);

	var forward = Camera.main.transform.TransformDirection(Vector3.forward);
	
	forward.y = 0;
	forward = forward.normalized;
	
	var right = Vector3(forward.z, 0, -forward.x);
	
	var v = Input.GetAxis("Vertical");
	var h = Input.GetAxis("Horizontal");
	
	targetDirection = h * right + v * forward;
	
	if (targetDirection != Vector3.zero)
	{
		targetRotation = Quaternion.LookRotation(targetDirection);
		transform.rotation = Quaternion.Lerp(transform.rotation, targetRotation, Time.deltaTime * 10);
	}
	else
	{
		targetRotation = Quaternion(0, 0, 0, 0);
	}
	
	if (PerformingPairedAnim == false)
	{
		if (v != 0 || h != 0)
		{
			if (Input.GetKey("left shift"))
			{
				Character.GetComponent.<Animation>().CrossFade(RunAnimName);
				MyController.Move(transform.forward * RunSpeed * Time.deltaTime);
			}
			else
			{
				Character.GetComponent.<Animation>().CrossFade(WalkAnimName);
				MyController.Move(transform.forward * WalkSpeed * Time.deltaTime);
			}
		}
		else
		{
			if (MyRenderer.sharedMesh == PonyMesh)
			{
				Character.GetComponent.<Animation>().CrossFade(IdleAnimName);
			}
			else
			{
				Character.GetComponent.<Animation>().CrossFade(TsunIdleAnimName);
			}
		}
	}
	else
	{
		if (Character.GetComponent(Animation)[PairedAnimName].time >= Character.GetComponent(Animation)[PairedAnimName].length)
		{
			Timer += Time.deltaTime;
			
			if (Timer > 1)
			{
				PerformingPairedAnim = false;
				Timer = 0;
			}
		}
		
		transform.LookAt(Victim.transform.position);
	}

	if (Victim != null)
	{
		if (Vector3.Distance(transform.position, Victim.transform.position) < 1)
		{
			if (Input.GetKeyDown("e"))
			{
				Character.GetComponent.<Animation>().CrossFade(PairedAnimName);
				Character.GetComponent(Animation)[PairedAnimName].time = 0;
				
				Victim.PerformPairedAnimation();
				PerformingPairedAnim = true;
			}
		}
	}
	
	if (Input.GetKeyDown("-"))
	{
		Time.timeScale -= .1;
	}
	
	if (Input.GetKeyDown("="))
	{
		Time.timeScale += .1;
	}
	
	if (Input.GetKeyDown("backspace"))
	{
		Time.timeScale = 1;
	}
	
	if (Input.GetKeyDown("h"))
	{
		if (DarkHair.active == true)
		{
			BecomeTsundere();
		}
		else
		{
			BecomeYandere();
		}
	}
	
	if (Input.GetKey("c"))
	{
		var ID = 0;
		
		if (ArmColliders[ID].enabled == false)
		{
			while (ID < ArmColliders.Length)
			{
				ArmColliders[ID].enabled = true;
				
				ID++;
			}
		}
		else
		{
			while (ID < ArmColliders.Length)
			{
				ArmColliders[ID].enabled = false;
				
				ID++;
			}
		}
	}
				
	if (Input.GetKey("b") || Input.GetKey("v"))
	{
		if (Input.GetKey("b"))
		{
			Angle = Mathf.Lerp(Angle, 90, Time.deltaTime * 10);
		}
		else
		{
			Angle = Mathf.Lerp(Angle, -90, Time.deltaTime * 10);
		}
	}
	else
	{
		Angle = Mathf.Lerp(Angle, 0, Time.deltaTime * 10);
	}
	
	if (Input.GetKeyDown("`"))
	{
		Application.LoadLevel(Application.loadedLevel);
	}

	if (Input.GetKeyDown("space"))
	{
		MyRenderer.sharedMesh = NoTorsoMesh;

		MyRenderer.materials[0].mainTexture = DarkHairTexture;
		MyRenderer.materials[1].mainTexture = DarkHairTexture;
		MyRenderer.materials[2].mainTexture = Nude;
		//MyRenderer.materials[3].mainTexture = DarkHairTexture;
		DarkHair.active = false;
		TsunHair.active = false;

		Dress.enabled = true;
	}

	/*
	if (transform.position.x > 4.5){transform.position.x = 4.5;}
	if (transform.position.x < -4.5){transform.position.x = -4.5;}
	if (transform.position.z > 4.5){transform.position.z = 4.5;}
	if (transform.position.z < -4.5){transform.position.z = -4.5;}
	*/
}

function LateUpdate()
{
	Spine.localEulerAngles.x += Angle;
}

function BecomeYandere()
{
	MyRenderer.sharedMesh = PonyMesh;
			
	MyRenderer.materials[0].mainTexture = DarkUniform;
	MyRenderer.materials[1].mainTexture = DarkHairTexture;
	MyRenderer.materials[2].mainTexture = DarkUniform;
	//MyRenderer.materials[3].mainTexture = DarkHairTexture;

	DarkHair.active = true;
	TsunHair.active = false;
}

function BecomeTsundere()
{
	MyRenderer.sharedMesh = BaldMesh;
			
	MyRenderer.materials[0].mainTexture = TsunUniform;
	MyRenderer.materials[1].mainTexture = TsunHairTexture;
	MyRenderer.materials[2].mainTexture = TsunUniform;
	//MyRenderer.materials[3].mainTexture = TsunHairTexture;

	DarkHair.active = false;
	TsunHair.active = true;
}