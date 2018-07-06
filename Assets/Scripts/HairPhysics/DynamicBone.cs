﻿using UnityEngine;
using System.Collections.Generic;

[AddComponentMenu("Dynamic Bone/Dynamic Bone")]
public class DynamicBone : MonoBehaviour 
{
	public Transform m_Root = null;
	public float m_UpdateRate = 60.0f;
	[Range(0,1)] public float m_Damping = 0.1f;
	public AnimationCurve m_DampingDistrib;
	[Range(0,1)] public float m_Elasticity = 0.1f;
	public AnimationCurve m_ElasticityDistrib;
	[Range(0,1)] public float m_Stiffness = 0.1f;
	public AnimationCurve m_StiffnessDistrib;
	[Range(0,1)] public float m_Inert = 0;
	public AnimationCurve m_InertDistrib;
	public float m_Radius = 0;
	public AnimationCurve m_RadiusDistrib;
		
	public float m_EndLength = 0;
	public Vector3 m_EndOffset = Vector3.zero;
	public Vector3 m_Gravity = Vector3.zero;
	public Vector3 m_Force = Vector3.zero;	
	public List<DynamicBoneCollider> m_Colliders;
	public List<Transform> m_Exclusions;

	Vector3 m_LocalGravity = Vector3.zero;
	Vector3 m_ObjectMove = Vector3.zero;
	Vector3 m_ObjectPrevPosition = Vector3.zero;
	float m_BoneTotalLength = 0;
	float m_ObjectScale = 1.0f;
	float m_Time = 0;
	float m_Weight = 1.0f;
	
	class Particle
	{
		public Transform m_Transform = null;
		public int m_ParentIndex = -1;
		public float m_Damping = 0;
		public float m_Elasticity = 0;
		public float m_Stiffness = 0;
		public float m_Inert = 0;
		public float m_Radius = 0;
		public float m_BoneLength = 0;
		
		public Vector3 m_Position = Vector3.zero;
		public Vector3 m_PrevPosition = Vector3.zero;
		public Vector3 m_EndOffset = Vector3.zero;
		public Vector3 m_InitLocalPosition = Vector3.zero;
		public Quaternion m_InitLocalRotation = Quaternion.identity;
	}
	
	List<Particle> m_Particles = new List<Particle>();
	
	void Start() 
	{
		SetupParticles();
	}
	
	void Update() 
	{
		if (m_Weight > 0)
		{
			InitTransforms();
		}
	}
	
	void LateUpdate()
	{
		if (m_Weight > 0)
		{
			UpdateDynamicBones(Time.deltaTime);	
		}
	}

	void OnEnable()
	{
		ResetParticlesPosition();
		m_ObjectPrevPosition = transform.position;
	}

	void OnDisable()
	{
		InitTransforms();
	}
	
	void OnValidate()
	{
		m_UpdateRate = Mathf.Max(m_UpdateRate, 0);
		m_Damping = Mathf.Clamp01(m_Damping);
		m_Elasticity = Mathf.Clamp01(m_Elasticity);
		m_Stiffness = Mathf.Clamp01(m_Stiffness);
		m_Inert = Mathf.Clamp01(m_Inert);
		m_Radius = Mathf.Max(m_Radius, 0);
		
		if (Application.isEditor && Application.isPlaying)
		{
			InitTransforms();
			SetupParticles();
		}
	}
	
	void OnDrawGizmosSelected()
	{
		if (!enabled || m_Root == null)
			return;
			
		if (Application.isEditor && !Application.isPlaying && transform.hasChanged)
		{
			InitTransforms();
			SetupParticles();	
		}
			
		Gizmos.color = Color.white;
		foreach (Particle p in m_Particles)
		{
			if (p.m_ParentIndex >= 0)
			{
				Particle p0 = m_Particles[p.m_ParentIndex];
				Gizmos.DrawLine(p.m_Position, p0.m_Position);
			}
			if (p.m_Radius > 0)
			{
				Gizmos.DrawWireSphere(p.m_Position, p.m_Radius * m_ObjectScale);
			}
		}
	}
	
	public void SetWeight(float w)
	{
		if (m_Weight != w)
		{
			if (w == 0)
			{
				InitTransforms();
			}
			else if (m_Weight == 0)
			{				
				ResetParticlesPosition();
				m_ObjectPrevPosition = transform.position;
			}
			m_Weight = w;
		}
	}
	
	public float GetWeight()
	{
		return m_Weight;
	}
	
	void UpdateDynamicBones(float t)
	{
		if (m_Root == null)
			return;
		
		m_ObjectScale = Mathf.Abs(transform.lossyScale.x);
		m_ObjectMove = transform.position - m_ObjectPrevPosition;
		m_ObjectPrevPosition = transform.position;
		
		int loop = 1;
		if (m_UpdateRate > 0)
		{
			float dt = 1.0f / m_UpdateRate;
			m_Time += t;
			loop = 0;
			
			while (m_Time >= dt)
			{
				m_Time -= dt;
				if (++loop >= 3)
				{
					m_Time = 0;
					break;
				}
			}
		}
		
		if (loop > 0)
		{
			for (int j=0; j<loop; ++j)
			{
				UpdateParticles1();
				UpdateParticles2();
				m_ObjectMove = Vector3.zero;
			}
		}
		else
		{
			SkipUpdateParticles();
		}

		ApplyParticlesToTransforms();	
	}
	
	void SetupParticles()
	{
		m_Particles.Clear();
		if (m_Root == null)
			return;
			
		m_LocalGravity = m_Root.InverseTransformDirection(m_Gravity);
		m_ObjectScale = transform.lossyScale.x;
		m_ObjectPrevPosition = transform.position;
		m_ObjectMove = Vector3.zero;
		m_BoneTotalLength = 0;
		AppendParticles(m_Root, -1, 0);
		
		foreach (Particle p in m_Particles)
		{
			p.m_Damping = m_Damping;
			p.m_Elasticity = m_Elasticity;
			p.m_Stiffness = m_Stiffness;
			p.m_Inert = m_Inert;
			p.m_Radius = m_Radius;
			
			if (m_BoneTotalLength > 0)
			{
				float a = p.m_BoneLength / m_BoneTotalLength;
				if (m_DampingDistrib.keys.Length > 0)
					p.m_Damping *= m_DampingDistrib.Evaluate(a);
				if (m_ElasticityDistrib.keys.Length > 0)
					p.m_Elasticity *= m_ElasticityDistrib.Evaluate(a);
				if (m_StiffnessDistrib.keys.Length > 0)
					p.m_Stiffness *= m_StiffnessDistrib.Evaluate(a);
				if (m_InertDistrib.keys.Length > 0)
					p.m_Inert *= m_InertDistrib.Evaluate(a);
				if (m_RadiusDistrib.keys.Length > 0)
					p.m_Radius *= m_RadiusDistrib.Evaluate(a);																			
			}
				
			p.m_Damping = Mathf.Clamp01(p.m_Damping);
			p.m_Elasticity = Mathf.Clamp01(p.m_Elasticity);
			p.m_Stiffness = Mathf.Clamp01(p.m_Stiffness);
			p.m_Inert = Mathf.Clamp01(p.m_Inert);
			p.m_Radius = Mathf.Max(p.m_Radius, 0);	
		}
	}
	
	void AppendParticles(Transform b, int parentIndex, float boneLength)
	{
		Particle p = new Particle();
		p.m_Transform = b;
		p.m_ParentIndex = parentIndex;
		if (b != null)
		{
			p.m_Position = p.m_PrevPosition = b.position;
			p.m_InitLocalPosition = b.localPosition;
			p.m_InitLocalRotation = b.localRotation;
		}
		else 	// end bone
		{
			Transform pb = m_Particles[parentIndex].m_Transform;
			if (m_EndLength > 0)
			{
				Transform ppb = pb.parent;
				if (ppb != null)
				{
					p.m_EndOffset = pb.InverseTransformPoint((pb.position * 2 - ppb.position)) * m_EndLength;
				}
				else
				{
					p.m_EndOffset = new Vector3(m_EndLength, 0, 0);
				}
			}
			else
			{
				p.m_EndOffset = pb.InverseTransformPoint(transform.TransformDirection(m_EndOffset) + pb.position);
			}
			p.m_Position = p.m_PrevPosition = pb.TransformPoint(p.m_EndOffset);
		}
		
		if (parentIndex >= 0)
		{
			boneLength += (m_Particles[parentIndex].m_Transform.position - p.m_Position).magnitude;
			p.m_BoneLength = boneLength;
			m_BoneTotalLength = Mathf.Max(m_BoneTotalLength, boneLength);
		}
		
		int index = m_Particles.Count;
		m_Particles.Add(p);
		
		if (b != null)
		{
			for (int i=0; i<b.childCount; ++i)
			{
				bool exclude = false;
				foreach (Transform e in m_Exclusions)
				{
					if (e == b.GetChild(i))
					{
						exclude = true;
						break;
					}
				}
				if (!exclude)
				{
					AppendParticles(b.GetChild(i), index, boneLength);
				}
			}	
			
			if (b.childCount == 0 && (m_EndLength > 0 || m_EndOffset != Vector3.zero))
			{
				AppendParticles(null, index, boneLength);
			}
		}
	}

	void InitTransforms()
	{
		foreach (Particle p in m_Particles)
		{
			if (p.m_Transform != null)
			{
				p.m_Transform.localPosition = p.m_InitLocalPosition;
				p.m_Transform.localRotation = p.m_InitLocalRotation;
			}
		}
	}
	
	void ResetParticlesPosition()
	{
		foreach (Particle p in m_Particles)
		{
			if (p.m_Transform != null)
			{
				p.m_Position = p.m_PrevPosition = p.m_Transform.position;
			}
			else	// end bone
			{
				Transform pb = m_Particles[p.m_ParentIndex].m_Transform;
				p.m_Position = p.m_PrevPosition = pb.TransformPoint(p.m_EndOffset);
			}
		}
	}

	void UpdateParticles1()
	{
		Vector3 force = m_Gravity;
		Vector3 fdir = m_Gravity.normalized;
		Vector3 rf = m_Root.TransformDirection(m_LocalGravity);
		Vector3 pf = fdir * Mathf.Max(Vector3.Dot(rf, fdir), 0);	// project current gravity to rest gravity
		force -= pf;	// remove projected gravity
		force = (force + m_Force) * m_ObjectScale;
		
		foreach (Particle p in m_Particles)
		{
			if (p.m_ParentIndex >= 0)
			{
				// verlet integration
				Vector3 v = p.m_Position - p.m_PrevPosition;
				Vector3 rmove = m_ObjectMove * p.m_Inert;
				p.m_PrevPosition = p.m_Position + rmove;
				p.m_Position += v * (1 - p.m_Damping) + force + rmove;
			}
			else
			{
				p.m_PrevPosition = p.m_Position;
				p.m_Position = p.m_Transform.position;
			}
		}	
	}
	
	void UpdateParticles2()
	{
		for (int i=1; i<m_Particles.Count; ++i)
		{
			Particle p = m_Particles[i];
			Particle p0 = m_Particles[p.m_ParentIndex];
				
			float restLen;
			if (p.m_Transform != null)
			{
				restLen = (p0.m_Transform.position - p.m_Transform.position).magnitude;
			}
			else
			{
				restLen = p.m_EndOffset.magnitude * m_ObjectScale;
			}
				
			// keep shape
			float stiffness = Mathf.Lerp(1.0f, p.m_Stiffness, m_Weight);
			if (stiffness > 0 || p.m_Elasticity > 0)
			{
				Matrix4x4 m0 = p0.m_Transform.localToWorldMatrix;
				m0.SetColumn(3, p0.m_Position);
				Vector3 restPos;
				if (p.m_Transform != null)
				{
					restPos = m0.MultiplyPoint3x4(p.m_Transform.localPosition);
				}
				else
				{
					restPos = m0.MultiplyPoint3x4(p.m_EndOffset);
				}
					
				Vector3 d = restPos - p.m_Position;
				p.m_Position += d * p.m_Elasticity;
				
				if (stiffness > 0)
				{
					d = restPos - p.m_Position;
					float len = d.magnitude;
					float maxlen = restLen * (1 - stiffness) * 2;
					if (len > maxlen)
					{
						p.m_Position += d * ((len - maxlen) / len);
					}
				}
			}
				
			// collide
			float particleRadius = p.m_Radius * m_ObjectScale;
			foreach (DynamicBoneCollider c in m_Colliders)
			{
				if (c != null && c.enabled)
					c.Collide(ref p.m_Position, particleRadius);	
			}
							
			// keep length
			Vector3 dd = p0.m_Position - p.m_Position;
			float leng = dd.magnitude;
			if (leng > 0)
			{
				p.m_Position += dd * ((leng - restLen) / leng);
			}
		}
	}
	
	// only update stiffness and keep bone length
	void SkipUpdateParticles()
	{	
		foreach (Particle p in m_Particles)
		{
			if (p.m_ParentIndex >= 0)
			{
				Vector3 rmove = m_ObjectMove * p.m_Inert;
				p.m_PrevPosition += rmove;
				p.m_Position += rmove;
					
				Particle p0 = m_Particles[p.m_ParentIndex];
				
				float restLen;
				if (p.m_Transform != null)
				{
					restLen = (p0.m_Transform.position - p.m_Transform.position).magnitude;
				}
				else
				{
					restLen = p.m_EndOffset.magnitude * m_ObjectScale;
				}
				
				// keep shape
				float stiffness = Mathf.Lerp(1.0f, p.m_Stiffness, m_Weight);
				if (stiffness > 0)
				{
					Matrix4x4 m0 = p0.m_Transform.localToWorldMatrix;
					m0.SetColumn(3, p0.m_Position);
					Vector3 restPos;
					if (p.m_Transform != null)
					{
						restPos = m0.MultiplyPoint3x4(p.m_Transform.localPosition);
					}
					else
					{
						restPos = m0.MultiplyPoint3x4(p.m_EndOffset);
					}	
					
					Vector3 d = restPos - p.m_Position;
					float len = d.magnitude;
					float maxlen = restLen * (1 - stiffness) * 2;
					if (len > maxlen)
					{
						p.m_Position += d * ((len - maxlen) / len);
					}
				}
				
				// keep length
				Vector3 dd = p0.m_Position - p.m_Position;
				float leng = dd.magnitude;
				if (leng > 0)
					p.m_Position += dd * ((leng - restLen) / leng);
			}
			else
			{
				p.m_PrevPosition = p.m_Position;
				p.m_Position = p.m_Transform.position;						
			}
		}
	}

	void ApplyParticlesToTransforms()
	{
		for (int i=1; i<m_Particles.Count; ++i)
		{
			Particle p = m_Particles[i];
			Particle p0 = m_Particles[p.m_ParentIndex];

			if (p0.m_Transform.childCount <= 1)		// do not modify bone orientation if has more then one child
			{
				Vector3 v;
				if (p.m_Transform != null)
				{
					v = p.m_Transform.localPosition;
				}
				else
				{
					v = p.m_EndOffset;
				}
				Quaternion rot = Quaternion.FromToRotation(p0.m_Transform.TransformDirection(v), p.m_Position - p0.m_Position);
				p0.m_Transform.rotation = rot * p0.m_Transform.rotation;	
			}

			if (p.m_Transform)
			{
				p.m_Transform.position = p.m_Position;
			}
		}
	}
}
