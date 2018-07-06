using UnityEngine;
using System.Collections;

public class RiggedAccessoryAttacher : MonoBehaviour {

    public GameObject root;
    public GameObject accessory;
    public Material[] accessoryMaterials;

	// Use this for initialization
	void Start () {
        AddLimb(accessory, root, accessoryMaterials);
	}
	
	void AddLimb(GameObject bonedObj, GameObject rootObj, Material[] bonedObjMaterials = null)
    {
        SkinnedMeshRenderer[] bonedObjects = bonedObj.gameObject.GetComponentsInChildren<SkinnedMeshRenderer>();
        foreach (SkinnedMeshRenderer skinnedRenderer in bonedObjects)
        {
            ProcessBonedObject(skinnedRenderer, rootObj, bonedObjMaterials);
        }
    }

    void ProcessBonedObject(SkinnedMeshRenderer thisRenderer, GameObject rootObj, Material[] thisRendererMaterials = null)
    {
        /*      Create the SubObject      */
        var newObj = new GameObject(thisRenderer.gameObject.name);
        newObj.transform.parent = rootObj.transform;

        /*      Add the renderer      */
        newObj.AddComponent<SkinnedMeshRenderer>();
        var newRenderer = newObj.GetComponent<SkinnedMeshRenderer>();

        /*      Assemble Bone Structure      */
        var myBones = new Transform[thisRenderer.bones.Length];
        for (int i = 0; i < thisRenderer.bones.Length; i++)
        {
            myBones[i] = FindChildByName(thisRenderer.bones[i].name, rootObj.transform);
        }

        /*      Assemble Renderer      */
        newRenderer.bones = myBones;
        newRenderer.sharedMesh = thisRenderer.sharedMesh;
        if (thisRendererMaterials == null)
        {
            newRenderer.materials = thisRenderer.sharedMaterials;
        }
        else
        {
            newRenderer.materials = thisRendererMaterials;
        }
    }
 
    Transform FindChildByName(string thisName, Transform thisGameObj)
    {
        Transform returnObj;
        if(thisGameObj.name == thisName)
            return thisGameObj.transform;
        foreach (Transform child in thisGameObj)
        {
            returnObj = FindChildByName(thisName, child);
            if (returnObj)
            {
                return returnObj;
            }
        }
        return null;
    }
}
