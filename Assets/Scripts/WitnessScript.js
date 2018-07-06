var VisionCone : Camera;

var Yandere : Collider;

function Update()
{
	Planes = GeometryUtility.CalculateFrustumPlanes(VisionCone);
				
	if (GeometryUtility.TestPlanesAABB(Planes, Yandere.bounds))
	{
		var Hit : RaycastHit;
		
		if (Physics.Linecast (VisionCone.transform.position, Yandere.transform.position, Hit))
		{
			if (Hit.collider.gameObject == Yandere.gameObject)
			{
				Debug.Log("We have line-of-sight with Yandere-chan.");
			}
			else
			{
				Debug.Log("Something is obscuring our view of Yandere-chan.");
			}
		}
	}
	else
	{
		Debug.Log("Yandere-chan is not within our cone of vision.");
	}
}