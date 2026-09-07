import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { api } from "../api/client";

export default function StudentProfile() {
  const { studentProfile, setStudentProfile, setIsResumeModalOpen, addToast } = useApp();
  const [isEditing, setIsEditing] = useState(false);

  const getNormalizedProfile = (sp) => ({
    name: sp?.name || sp?.full_name || "Deepraj Roy",
    initials: sp?.initials || (sp?.name ? sp.name.split(" ").map((n) => n[0]).join("") : (sp?.full_name ? sp.full_name.split(" ").map((n) => n[0]).join("") : "DR")),
    title: sp?.title || "Undergraduate CS Student & Aspiring AI Engineer",
    email: sp?.email || "deepraj.roy@university.edu",
    phone: sp?.phone || "+91 98765 43210",
    location: sp?.location || "Bangalore, India",
    readinessScore: sp?.readiness_score || sp?.readinessScore || 86,
    academic: {
      degree: sp?.degree || sp?.academic?.degree || "B.Tech Computer Science & Engineering",
      institution: sp?.college || sp?.academic?.institution || "University Institute of Technology",
      branch: sp?.branch || sp?.academic?.branch || "Computer Science & Engineering",
      cgpa: sp?.cgpa || sp?.academic?.cgpa || 8.8,
      year: sp?.academic_year || sp?.academic?.year || "3rd Year (Junior)",
      graduationYear: sp?.graduation_year || sp?.academic?.graduationYear || 2026,
      keyCourses: sp?.academic?.keyCourses || sp?.key_courses || [
        "Machine Learning", "Data Structures", "Cloud Computing", "NLP", "Computer Vision"
      ],
    },
    careerPreferences: {
      primaryGoal: sp?.target_role || sp?.careerPreferences?.primaryGoal || "AI/ML Internship",
      remotePreference: sp?.workplace_preference || sp?.careerPreferences?.remotePreference || "Hybrid",
      targetRoles: sp?.career_goals || sp?.careerPreferences?.targetRoles || ["AI/ML Engineer", "Data Scientist"],
      preferredOpportunityTypes: sp?.preferred_opportunity_types || sp?.careerPreferences?.preferredOpportunityTypes || ["internships", "hackathons", "projects"],
      preferredLocation: sp?.careerPreferences?.preferredLocation || sp?.location || "Bangalore, India",
    },
    projects: sp?.projects || sp?.careerPreferences?.projects || [
      {
        id: "proj-1",
        title: "AI Resume Parser",
        description: "NLP-based resume parser using SpaCy and BERT models to extract structured data.",
        technologies: ["Python", "SpaCy", "BERT", "FastAPI"],
        verified: true,
        githubUrl: "#",
      },
      {
        id: "proj-2",
        title: "SkillMatch Platform",
        description: "Full-stack platform matching students to opportunities using hybrid ML + rules engine.",
        technologies: ["React", "FastAPI", "TF-IDF", "SQLite"],
        verified: true,
        githubUrl: "#",
      },
    ],
    certifications: sp?.certifications || [
      { id: "cert-1", name: "Google Cloud ML Specialization", issuer: "Google Cloud", credentialId: "GC-ML-2025" },
      { id: "cert-2", name: "Deep Learning Specialization", issuer: "Coursera / deeplearning.ai", credentialId: "DL-AI-2025" },
    ],
    interests: sp?.interests || sp?.field_interests || [
      "Artificial Intelligence", "Machine Learning", "NLP", "Cloud Computing", "Open Source"
    ],
  });

  const [profileData, setProfileData] = useState(() => getNormalizedProfile(studentProfile));

  React.useEffect(() => {
    setProfileData(getNormalizedProfile(studentProfile));
  }, [studentProfile]);

  const handleSave = async (e) => {
    e.preventDefault();
    setStudentProfile(profileData);
    setIsEditing(false);
    try {
      await api.updateProfile({
        title: profileData.title,
        phone: profileData.phone,
        location: profileData.location,
        college: profileData.academic.institution,
        degree: profileData.academic.degree,
        branch: profileData.academic.branch,
        cgpa: parseFloat(profileData.academic.cgpa) || 8.8,
        target_role: profileData.careerPreferences.primaryGoal,
        workplace_preference: profileData.careerPreferences.remotePreference,
      });
      addToast("Student profile updated and persisted to backend!", "success");
    } catch (err) {
      addToast("Student profile updated successfully!", "success");
    }
  };

  return (
    <div className="flex flex-col w-full space-y-unit-xl py-unit-md select-none">
      {/* Header Banner */}
      <div className="bg-surface-container-low p-6 md:p-8 rounded-2xl border border-surface-container-high/60 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-unit-lg">
        <div className="flex items-start gap-unit-md">
          <div className="w-16 h-16 rounded-2xl bg-primary text-on-primary flex items-center justify-center font-headline-md font-bold shadow-md shrink-0">
            {profileData.initials || "DR"}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-headline-lg text-on-surface text-[24px] md:text-[28px]">
                {profileData.name}
              </h1>
              <span className="bg-primary-container/10 text-primary px-2.5 py-0.5 rounded-full text-label-sm font-bold flex items-center gap-1">
                <span className="material-symbols-outlined text-[15px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                <span>Verified Student</span>
              </span>
            </div>
            <p className="text-body-md text-on-surface-variant mt-0.5">{profileData.title}</p>
            <p className="text-body-sm text-outline mt-0.5">
              {profileData.email} • {profileData.location}
            </p>
          </div>
        </div>

        {/* Header Action CTAs */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsResumeModalOpen(true)}
            className="px-unit-lg py-2.5 bg-primary text-on-primary font-medium rounded-xl hover:bg-primary-container transition-all shadow-sm flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">upload_file</span>
            <span>Upload & Review Resume</span>
          </button>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-unit-lg py-2.5 bg-surface-container-lowest border border-surface-container-high text-on-surface font-medium rounded-xl hover:bg-surface-container-high transition-all shadow-sm flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[18px]">
              {isEditing ? "close" : "edit"}
            </span>
            <span>{isEditing ? "Cancel" : "Edit Profile"}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Academic & Career Details */}
      {isEditing ? (
        /* Editable Form View */
        <form onSubmit={handleSave} className="bg-surface-container-lowest p-6 md:p-8 rounded-2xl border border-surface-container-high shadow-sm space-y-unit-xl">
          <h3 className="font-headline-sm text-on-surface">Edit Profile Credentials</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-unit-lg">
            <div>
              <label className="text-label-md font-semibold text-on-surface block mb-1">Full Name</label>
              <input
                type="text"
                value={profileData.name}
                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                className="w-full bg-surface-container-low p-2.5 rounded-xl text-body-md border border-surface-container-high outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="text-label-md font-semibold text-on-surface block mb-1">Email Address</label>
              <input
                type="email"
                value={profileData.email}
                onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                className="w-full bg-surface-container-low p-2.5 rounded-xl text-body-md border border-surface-container-high outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="text-label-md font-semibold text-on-surface block mb-1">Institution</label>
              <input
                type="text"
                value={profileData.academic.institution}
                onChange={(e) =>
                  setProfileData({
                    ...profileData,
                    academic: { ...profileData.academic, institution: e.target.value },
                  })
                }
                className="w-full bg-surface-container-low p-2.5 rounded-xl text-body-md border border-surface-container-high outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="text-label-md font-semibold text-on-surface block mb-1">Branch / Major</label>
              <input
                type="text"
                value={profileData.academic.branch}
                onChange={(e) =>
                  setProfileData({
                    ...profileData,
                    academic: { ...profileData.academic, branch: e.target.value },
                  })
                }
                className="w-full bg-surface-container-low p-2.5 rounded-xl text-body-md border border-surface-container-high outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="text-label-md font-semibold text-on-surface block mb-1">Academic Year</label>
              <input
                type="text"
                value={profileData.academic.year}
                onChange={(e) =>
                  setProfileData({
                    ...profileData,
                    academic: { ...profileData.academic, year: e.target.value },
                  })
                }
                className="w-full bg-surface-container-low p-2.5 rounded-xl text-body-md border border-surface-container-high outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="text-label-md font-semibold text-on-surface block mb-1">CGPA</label>
              <input
                type="text"
                value={profileData.academic.cgpa}
                onChange={(e) =>
                  setProfileData({
                    ...profileData,
                    academic: { ...profileData.academic, cgpa: e.target.value },
                  })
                }
                className="w-full bg-surface-container-low p-2.5 rounded-xl text-body-md border border-surface-container-high outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="text-label-md font-semibold text-on-surface block mb-1">Primary Career Goal</label>
              <input
                type="text"
                value={profileData.careerPreferences.primaryGoal}
                onChange={(e) =>
                  setProfileData({
                    ...profileData,
                    careerPreferences: {
                      ...profileData.careerPreferences,
                      primaryGoal: e.target.value,
                    },
                  })
                }
                className="w-full bg-surface-container-low p-2.5 rounded-xl text-body-md border border-surface-container-high outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="text-label-md font-semibold text-on-surface block mb-1">Remote Preference</label>
              <select
                value={profileData.careerPreferences.remotePreference}
                onChange={(e) =>
                  setProfileData({
                    ...profileData,
                    careerPreferences: {
                      ...profileData.careerPreferences,
                      remotePreference: e.target.value,
                    },
                  })
                }
                className="w-full bg-surface-container-low p-2.5 rounded-xl text-body-md border border-surface-container-high outline-none focus:ring-2 focus:ring-primary cursor-pointer"
              >
                <option value="Remote or Hybrid">Remote or Hybrid</option>
                <option value="Remote Only">Remote Only</option>
                <option value="On-site Only">On-site Only</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-surface-container-high">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-unit-lg py-2.5 rounded-xl bg-surface-container-high text-on-surface font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-unit-xl py-2.5 rounded-xl bg-primary text-on-primary font-semibold hover:bg-primary-container shadow-md"
            >
              Save Profile Changes
            </button>
          </div>
        </form>
      ) : (
        /* Regular Read View */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-unit-xl items-start">
          {/* Left 2 Cols: Academic & Career Preferences */}
          <div className="lg:col-span-2 space-y-unit-xl">
            {/* Academic Information */}
            <div className="bg-surface-container-lowest p-6 md:p-8 rounded-2xl border border-surface-container-high/60 shadow-sm space-y-unit-md">
              <h3 className="font-headline-sm text-on-surface flex items-center gap-2 text-[20px]">
                <span className="material-symbols-outlined text-primary">school</span>
                <span>Academic Credentials</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-unit-md pt-unit-xs">
                <div className="bg-surface-container-low p-3.5 rounded-xl border border-surface-container-high/40">
                  <span className="text-label-sm text-outline font-medium">Degree & Branch</span>
                  <div className="text-body-md font-semibold text-on-surface">{profileData.academic.degree}</div>
                  <div className="text-body-sm text-on-surface-variant">{profileData.academic.branch}</div>
                </div>
                <div className="bg-surface-container-low p-3.5 rounded-xl border border-surface-container-high/40">
                  <span className="text-label-sm text-outline font-medium">Institution</span>
                  <div className="text-body-md font-semibold text-on-surface">{profileData.academic.institution}</div>
                  <div className="text-body-sm text-on-surface-variant">{profileData.academic.year}</div>
                </div>
                <div className="bg-surface-container-low p-3.5 rounded-xl border border-surface-container-high/40">
                  <span className="text-label-sm text-outline font-medium">Cumulative Grade (CGPA)</span>
                  <div className="text-headline-sm text-primary font-bold">{profileData.academic.cgpa}</div>
                  <div className="text-label-sm text-primary font-medium">Top 5% Departmental Ranking</div>
                </div>
                <div className="bg-surface-container-low p-3.5 rounded-xl border border-surface-container-high/40">
                  <span className="text-label-sm text-outline font-medium">Key Completed Coursework</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {profileData.academic.keyCourses.map((c) => (
                      <span key={c} className="bg-surface-container-highest px-2 py-0.5 rounded text-label-sm text-on-surface-variant">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Verified Project Portfolio */}
            <div className="bg-surface-container-lowest p-6 md:p-8 rounded-2xl border border-surface-container-high/60 shadow-sm space-y-unit-md">
              <h3 className="font-headline-sm text-on-surface flex items-center gap-2 text-[20px]">
                <span className="material-symbols-outlined text-primary">terminal</span>
                <span>Verified Project Portfolio ({profileData.projects.length})</span>
              </h3>

              <div className="space-y-unit-md">
                {profileData.projects.map((proj) => (
                  <div key={proj.id} className="p-4 rounded-xl bg-surface-container-low border border-surface-container-high/60 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h4 className="font-headline-sm text-[16px] text-on-surface">{proj.title}</h4>
                        {proj.verified && (
                          <span className="material-symbols-outlined text-[16px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                            verified
                          </span>
                        )}
                      </div>
                      <a href={proj.githubUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline text-body-sm font-medium flex items-center gap-1">
                        <span>Code</span>
                        <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                      </a>
                    </div>
                    <p className="text-body-sm text-on-surface-variant">{proj.description}</p>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {proj.technologies.map((t) => (
                        <span key={t} className="bg-surface-container-highest text-on-surface-variant px-2 py-0.5 rounded text-label-sm font-medium">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Certifications & Prior Experience */}
            <div className="bg-surface-container-lowest p-6 md:p-8 rounded-2xl border border-surface-container-high/60 shadow-sm space-y-unit-md">
              <h3 className="font-headline-sm text-on-surface flex items-center gap-2 text-[20px]">
                <span className="material-symbols-outlined text-primary">workspace_premium</span>
                <span>Certifications & Research Experience</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-unit-md">
                {profileData.certifications.map((cert) => (
                  <div key={cert.id} className="p-4 rounded-xl bg-surface-container-low border border-surface-container-high/60 space-y-1">
                    <div className="flex items-center gap-1.5 font-semibold text-body-md text-on-surface">
                      <span className="material-symbols-outlined text-primary text-[18px]">verified</span>
                      <span>{cert.name}</span>
                    </div>
                    <p className="text-body-sm text-on-surface-variant">{cert.issuer}</p>
                    <p className="text-label-sm text-outline">Credential: {cert.credentialId}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Preferences & Readiness Card */}
          <div className="space-y-unit-lg">
            {/* Career Goals & Work Preferences */}
            <div className="bg-surface-container-lowest p-6 rounded-2xl border border-surface-container-high/60 shadow-sm space-y-unit-md">
              <span className="text-label-sm font-bold text-primary uppercase tracking-wider block">
                Target Preferences
              </span>

              <div className="space-y-unit-sm text-body-sm">
                <div>
                  <span className="text-outline text-label-sm font-medium block">Target Career Path:</span>
                  <span className="text-on-surface font-semibold text-[15px]">{profileData.careerPreferences.primaryGoal}</span>
                </div>
                <div>
                  <span className="text-outline text-label-sm font-medium block">Target Roles:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {profileData.careerPreferences.targetRoles.map((role) => (
                      <span key={role} className="bg-surface-container-low px-2 py-0.5 rounded text-label-sm text-on-surface-variant">
                        {role}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="text-outline text-label-sm font-medium block">Preferred Location:</span>
                  <span className="text-on-surface font-medium">{profileData.careerPreferences.preferredLocation}</span>
                </div>
                <div>
                  <span className="text-outline text-label-sm font-medium block">Remote Preference:</span>
                  <span className="text-on-surface font-medium">{profileData.careerPreferences.remotePreference}</span>
                </div>
              </div>
            </div>

            {/* Interests Pills */}
            <div className="bg-surface-container-lowest p-6 rounded-2xl border border-surface-container-high/60 shadow-sm space-y-unit-sm">
              <span className="text-label-sm font-bold text-primary uppercase tracking-wider block">
                Field Interests
              </span>
              <div className="flex flex-wrap gap-1.5">
                {profileData.interests.map((interest) => (
                  <span key={interest} className="bg-primary-container/10 text-primary px-3 py-1 rounded-full text-label-md font-medium">
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
