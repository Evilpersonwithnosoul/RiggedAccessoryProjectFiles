import UnityEngine;
import System.Collections;
import System.Collections.Generic;
import System.IO;
import JsonFx.Json;

var StudentFileName : String;
var CreditsFileName : String;
var TopicFileName : String;

function StudentData()
{
	var json : String;
    var filePath = System.IO.Path.Combine("JSON", StudentFileName + ".json");
	filePath = System.IO.Path.Combine(Application.streamingAssetsPath, filePath);
	json = File.ReadAllText(filePath);
    return JsonReader.Deserialize(json) as Dictionary.<String,System.Object>[];
}

function TopicData()
{
	var json : String;
    var filePath = System.IO.Path.Combine("JSON", TopicFileName + ".json");
	filePath = System.IO.Path.Combine(Application.streamingAssetsPath, filePath);
	json = File.ReadAllText(filePath);
    return JsonReader.Deserialize(json) as Dictionary.<String,System.Object>[];
}

function CreditsData()
{
	//if (CreditsFileName != "")
	//{
		var json : String;
	    var filePath = System.IO.Path.Combine("JSON", CreditsFileName + ".json");
		filePath = System.IO.Path.Combine(Application.streamingAssetsPath, filePath);
		json = File.ReadAllText(filePath);
	    return JsonReader.Deserialize(json) as Dictionary.<String,System.Object>[];
	//}
}

//Student Data
var StudentNames : String[];
var StudentGenders : int[];
var StudentClasses : int[];
var StudentSeats : int[];
var StudentClubs : int[];
var StudentPersonas : int[];
var StudentCrushes : int[];
var StudentBreasts : float[];
var StudentStrengths : int[];
var StudentHairstyles : String[];
var StudentColors : String[];
var StudentEyes : String[];
var StudentStockings : String[];
var StudentAccessories : String[];

var StudentTimes : Array[];
var StudentDestinations : Array[];
var StudentActions : Array[];

var TotalStudents = 0;

private var TempStringArray : String[];
private var TempFloatArray : float[];
private var TempIntArray : int[];

private var TempString : String;
private var TempFloat : float;
private var TempInt : int;

private var ID : int;

var CreditsNames : String[];
var CreditsSizes : int[];

function Start()
{
	StudentTimes = new Array[TotalStudents + 1];
	StudentDestinations = new Array[TotalStudents + 1];
	StudentActions = new Array[TotalStudents + 1];
	
	//DontDestroyOnLoad (transform.gameObject);

	for(var dict in StudentData())
	{
		ID = TFUtils.LoadInt (dict, "ID");
		
		if (ID == null || ID == 0)
			break;
		
		StudentNames[ID] = TFUtils.LoadString (dict, "Name");
		StudentGenders[ID] = TFUtils.LoadInt (dict, "Gender");
		StudentClasses[ID] = TFUtils.LoadInt (dict, "Class");
		StudentSeats[ID] = TFUtils.LoadInt (dict, "Seat");
		StudentClubs[ID] = TFUtils.LoadInt (dict, "Club");
		StudentPersonas[ID] = TFUtils.LoadInt (dict, "Persona");
		StudentCrushes[ID] = TFUtils.LoadInt (dict, "Crush");
		StudentBreasts[ID] = TFUtils.LoadFloat (dict, "BreastSize");
		StudentStrengths[ID] = TFUtils.LoadFloat (dict, "Strength");
		StudentHairstyles[ID] = TFUtils.LoadString (dict, "Hairstyle");
		StudentColors[ID] = TFUtils.LoadString (dict, "Color");
		StudentEyes[ID] = TFUtils.LoadString (dict, "Eyes");
		StudentStockings[ID] = TFUtils.LoadString (dict, "Stockings");
		StudentAccessories[ID] = TFUtils.LoadString (dict, "Accessory");
		
		if (PlayerPrefs.GetInt("HighPopulation") == 1)
		{
			if (StudentNames[ID] == "Unknown")
			{
				StudentNames[ID] = "Random";
			}
		}
		
		TempString = TFUtils.LoadString (dict, "ScheduleTime");
		ConstructTempFloatArray();
		StudentTimes[ID] = TempFloatArray;

		TempString = TFUtils.LoadString (dict, "ScheduleDestination");
		ConstructTempStringArray();
		StudentDestinations[ID] = TempStringArray;
		
		TempString = TFUtils.LoadString (dict, "ScheduleAction");
		ConstructTempStringArray();
		StudentActions[ID] = TempStringArray;
	}
	
	if (Application.loadedLevelName == "SchoolScene")
	{
		for(var dict in TopicData())
		{
			ID = TFUtils.LoadInt (dict, "ID");
			
			if (ID == null || ID == 0)
				break;
			
			Topic1[ID] = TFUtils.LoadInt (dict, "1");
			Topic2[ID] = TFUtils.LoadInt (dict, "2");
			Topic3[ID] = TFUtils.LoadInt (dict, "3");
			Topic4[ID] = TFUtils.LoadInt (dict, "4");
			Topic5[ID] = TFUtils.LoadInt (dict, "5");
			Topic6[ID] = TFUtils.LoadInt (dict, "6");
			Topic7[ID] = TFUtils.LoadInt (dict, "7");
			Topic8[ID] = TFUtils.LoadInt (dict, "8");
			Topic9[ID] = TFUtils.LoadInt (dict, "9");
			Topic10[ID] = TFUtils.LoadInt (dict, "10");
			Topic11[ID] = TFUtils.LoadInt (dict, "11");
			Topic12[ID] = TFUtils.LoadInt (dict, "12");
			Topic13[ID] = TFUtils.LoadInt (dict, "13");
			Topic14[ID] = TFUtils.LoadInt (dict, "14");
			Topic15[ID] = TFUtils.LoadInt (dict, "15");
			Topic16[ID] = TFUtils.LoadInt (dict, "16");
			Topic17[ID] = TFUtils.LoadInt (dict, "17");
			Topic18[ID] = TFUtils.LoadInt (dict, "18");
			Topic19[ID] = TFUtils.LoadInt (dict, "19");
			Topic20[ID] = TFUtils.LoadInt (dict, "20");
			Topic21[ID] = TFUtils.LoadInt (dict, "21");
			Topic22[ID] = TFUtils.LoadInt (dict, "22");
			Topic23[ID] = TFUtils.LoadInt (dict, "23");
			Topic24[ID] = TFUtils.LoadInt (dict, "24");
			Topic25[ID] = TFUtils.LoadInt (dict, "25");
		}
		
		ReplaceDeadTeachers();
	}
	
	if (Application.loadedLevelName == "CreditsScene")
	{
		for(var dict in CreditsData())
		{
			ID = TFUtils.LoadInt (dict, "ID");
			
			if (ID == null || ID == 0)
				break;
			
			CreditsNames[ID] = TFUtils.LoadString (dict, "Name");
			CreditsSizes[ID] = TFUtils.LoadInt (dict, "Size");
		}
	}
}

var Topic1 : int[];
var Topic2 : int[];
var Topic3 : int[];
var Topic4 : int[];
var Topic5 : int[];
var Topic6 : int[];
var Topic7 : int[];
var Topic8 : int[];
var Topic9 : int[];
var Topic10 : int[];
var Topic11 : int[];
var Topic12 : int[];
var Topic13 : int[];
var Topic14 : int[];
var Topic15 : int[];
var Topic16 : int[];
var Topic17 : int[];
var Topic18 : int[];
var Topic19 : int[];
var Topic20 : int[];
var Topic21 : int[];
var Topic22 : int[];
var Topic23 : int[];
var Topic24 : int[];
var Topic25 : int[];

function ConstructTempFloatArray()
{
	TempStringArray = TempString.Split("_"[0]);
	TempFloatArray = new float[TempStringArray.Length];
	TempID = 0;

	while (TempID < TempStringArray.Length)
	{
		TempFloatArray[TempID] = float.Parse(TempStringArray[TempID]);
		TempID++;
	}
}

function ConstructTempStringArray()
{
	TempStringArray = TempString.Split("_"[0]);
}

function ReplaceDeadTeachers()
{
	ID = 94;
	
	while (ID < 101)
	{
		//Debug.Log("Checking the character with the ID of " + ID + "...");
		
		if (PlayerPrefs.GetInt("Student_" + ID + "_Dead") == 1)
		{
			//Debug.Log("The character with the ID of " + ID + " died! Now generating new character.");
			
			PlayerPrefs.SetInt("Student_" + ID + "_Replaced", 1);
			PlayerPrefs.SetInt("Student_" + ID + "_Dead", 0);
			
			var NewName = "Whatever";
			PlayerPrefs.SetString("Student_" + ID + "_Name", NewName);
			
			PlayerPrefs.SetFloat("Student_" + ID + "_BustSize", Random.Range(1.0, 1.5));
			PlayerPrefs.SetString("Student_" + ID + "_Hairstyle", "" + Random.Range(1, 8));
			
			var R = Random.Range(0.0, 1.0);
			var G = Random.Range(0.0, 1.0);
			var B = Random.Range(0.0, 1.0);
			
			PlayerPrefs.SetFloat("Student_" + ID + "_ColorR", R);
			PlayerPrefs.SetFloat("Student_" + ID + "_ColorG", G);
			PlayerPrefs.SetFloat("Student_" + ID + "_ColorB", B);
			
			R = Random.Range(0.0, 1.0);
			G = Random.Range(0.0, 1.0);
			B = Random.Range(0.0, 1.0);
			
			PlayerPrefs.SetFloat("Student_" + ID + "_EyeColorR", R);
			PlayerPrefs.SetFloat("Student_" + ID + "_EyeColorG", G);
			PlayerPrefs.SetFloat("Student_" + ID + "_EyeColorB", B);
			
			PlayerPrefs.SetString("Student_" + ID + "_Accessory", "" + Random.Range(1, 7));
		}
		
		ID++;
	}
	
	ID = 94;
	
	while (ID < 100)
	{
		if (PlayerPrefs.GetInt("Student_" + ID + "_Replaced") == 1)
		{
			StudentNames[ID] = PlayerPrefs.GetString("Student_" + ID + "_Name");
			StudentBreasts[ID] = PlayerPrefs.GetFloat("Student_" + ID + "_BustSize");
			StudentHairstyles[ID] = PlayerPrefs.GetString("Student_" + ID + "_Hairstyle");
			StudentAccessories[ID] = PlayerPrefs.GetString("Student_" + ID + "_Accessory");
			
			if (ID == 100)
			{
				StudentAccessories[100] = "7";
			}
		}
		
		ID++;
	}
}