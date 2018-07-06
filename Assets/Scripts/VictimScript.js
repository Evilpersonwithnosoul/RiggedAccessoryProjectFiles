var Character : GameObject;

var Yandere : Transform;

var PerformingPairedAnim = false;
var FacePlayer = false;

var PairedDistance = 0.0;

var PairedAnimName = "";
var IdleAnimName = "";

private var ResetTimer = 0.0;

function Update ()
{
	if (PerformingPairedAnim == true)
	{
		Character.GetComponent.<Animation>().CrossFade(PairedAnimName);
		
		if (ResetTimer == 0)
		{
			transform.position = Vector3.Lerp(transform.position, Yandere.position + Yandere.forward * PairedDistance, Time.deltaTime * 10);
			
			transform.LookAt(Yandere.position);
			
			if (FacePlayer == false)
			{
				transform.localEulerAngles.y += 180;
			}
		}
		
		if (Character.GetComponent(Animation)[PairedAnimName].time >= Character.GetComponent(Animation)[PairedAnimName].length)
		{
			ResetTimer += Time.deltaTime;
		
			if (ResetTimer > 1)
			{
				PerformingPairedAnim = false;
				ResetTimer = 0;
			}
		}
	}
	else
	{
		Character.GetComponent.<Animation>().CrossFade(IdleAnimName);
	}
}

function PerformPairedAnimation()
{
	Character.GetComponent(Animation)[PairedAnimName].time = 0;
	PerformingPairedAnim = true;
	ResetTimer = 0;
}