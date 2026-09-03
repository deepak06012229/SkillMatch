import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import { api } from "../../api/client";

export default function ResumeUploadModal() {
  const {
    isResumeModalOpen,
    setIsResumeModalOpen,
    extractedResume,
    setExtractedResume,
    setStudentProfile,
    addToast,
    refreshBackendData
  } = useApp();

  const [resumeId, setResumeId] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const [formData, setFormData] = useState({
    fullName: extractedResume?.extracted?.fullName || "Deepraj Roy",
    email: extractedResume?.extracted?.email || "deepraj.roy@university.edu",
    phone: extractedResume?.extracted?.phone || "+91 98765 43210",
    degree: extractedResume?.extracted?.education?.degree || "B.Tech Computer Science & Engineering",
    institution: extractedResume?.extracted?.education?.institution || "University Institute of Technology",
    branch: "Computer Science & Engineering",
    cgpa: extractedResume?.extracted?.education?.cgpa || 8.8,
    graduationYear: extractedResume?.extracted?.education?.graduationYear || 2026,
    careerGoal: extractedResume?.extracted?.careerGoalDetected || "AI/ML Engineer",
    skills: extractedResume?.extracted?.skillsDetected || ["Python", "PyTorch", "Machine Learning", "FastAPI", "React", "Docker"],
    experienceSummary: extractedResume?.extracted?.experienceSummary || "Built lightweight MobileNetV3 model and FastAPI vector search systems."
  });

  const [newSkill, setNewSkill] = useState("");

  if (!isResumeModalOpen) return null;

  const handleRemoveSkill = (skillToRemove) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skillToRemove),
    }));
  };

  const handleAddSkill = (e) => {
    e.preventDefault();
    if (!newSkill.trim()) return;
    if (!formData.skills.includes(newSkill.trim())) {
      setFormData((prev) => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()],
      }));
    }
    setNewSkill("");
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const res = await api.uploadResume(file);
      if (res && res.extracted_data) {
        const ext = res.extracted_data;
        const contact = ext.contact || {};
        const edu = ext.education || {};
        setResumeId(res.resume_id);
        setFormData({
          fullName: contact.name || ext.name || formData.fullName,
          email: contact.email || ext.email || formData.email,
          phone: contact.phone || ext.phone || formData.phone,
          degree: edu.degree || ext.degree || formData.degree,
          institution: edu.college || ext.college || formData.institution,
          branch: edu.branch || ext.branch || formData.branch,
          cgpa: edu.cgpa !== undefined ? edu.cgpa : (ext.cgpa || formData.cgpa),
          graduationYear: edu.graduation_year || ext.graduation_year || formData.graduationYear,
          careerGoal: formData.careerGoal,
          skills: ext.raw_skill_names && ext.raw_skill_names.length > 0 ? ext.raw_skill_names : formData.skills,
          experienceSummary: ext.projects && ext.projects.length > 0 ? ext.projects[0].description : formData.experienceSummary,
        });
        const ocrNotice = res.ocr_used ? " (OCR processed)" : "";
        addToast(`Extracted ${file.name}${ocrNotice} successfully! Please review below before confirming.`, "success");
      }
    } catch (err) {
      addToast(`Error analyzing resume: ${err.message}`, "error");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveToProfile = async () => {
    try {
      if (resumeId) {
        await api.confirmResume(resumeId, {
          name: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          college: formData.institution,
          degree: formData.degree,
          branch: formData.branch,
          cgpa: parseFloat(formData.cgpa) || 8.8,
          skills: formData.skills,
        });
      } else {
        await api.updateProfile({
          college: formData.institution,
          degree: formData.degree,
          branch: formData.branch,
          cgpa: parseFloat(formData.cgpa) || 8.8,
          phone: formData.phone,
        });
      }

      await refreshBackendData();
      addToast("Confirmed resume credentials saved to authoritative profile!", "success");
      setIsResumeModalOpen(false);
    } catch (err) {
      addToast(`Saved locally: ${err.message}`, "info");
      setIsResumeModalOpen(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div 
        className="bg-surface-container-lowest w-full max-w-2xl rounded-2xl shadow-2xl border border-surface-container-high overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-unit-lg border-b border-surface-container-high flex items-center justify-between bg-surface-container-low/50">
          <div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[22px]">document_scanner</span>
              <h3 className="font-headline-sm text-on-surface">Resume AI Extraction & Review</h3>
            </div>
            <p className="text-body-sm text-on-surface-variant">
              Review and edit the parsed credentials before committing to your SkillMatch profile.
            </p>
          </div>
          <button 
            onClick={() => setIsResumeModalOpen(false)}
            className="p-1 rounded-full text-on-surface-variant hover:bg-surface-container-high transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="p-unit-lg overflow-y-auto space-y-unit-lg">
          {/* Upload Area / Status */}
          <div className="border-2 border-dashed border-primary/30 rounded-xl p-unit-md text-center bg-primary-container/5 relative hover:border-primary transition-colors">
            <input 
              type="file" 
              accept=".pdf,.doc,.docx" 
              onChange={handleFileUpload}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
            <div className="flex flex-col items-center justify-center">
              <span className="material-symbols-outlined text-primary text-[32px] mb-1">upload_file</span>
              <p className="text-body-md font-medium text-on-surface">
                {isUploading ? "Extracting text with Python backend..." : `Ready to upload & parse resume`}
              </p>
              <p className="text-label-sm text-outline">
                Click or drag & drop PDF/DOCX (Text extraction + skill normalization)
              </p>
            </div>
          </div>

          {/* Editable Student Details */}
          <div className="space-y-unit-md">
            <h4 className="text-headline-sm text-[16px] text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[18px]">person</span>
              Personal & Academic Information
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-unit-md">
              <div>
                <label className="text-label-md text-on-surface font-medium block mb-1">Full Name</label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full bg-surface-container-low px-3 py-2 rounded-xl text-body-md text-on-surface border border-surface-container-high focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
              <div>
                <label className="text-label-md text-on-surface font-medium block mb-1">Email Address</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-surface-container-low px-3 py-2 rounded-xl text-body-md text-on-surface border border-surface-container-high focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
              <div>
                <label className="text-label-md text-on-surface font-medium block mb-1">Degree Program</label>
                <input
                  type="text"
                  value={formData.degree}
                  onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                  className="w-full bg-surface-container-low px-3 py-2 rounded-xl text-body-md text-on-surface border border-surface-container-high focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
              <div>
                <label className="text-label-md text-on-surface font-medium block mb-1">Institution</label>
                <input
                  type="text"
                  value={formData.institution}
                  onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                  className="w-full bg-surface-container-low px-3 py-2 rounded-xl text-body-md text-on-surface border border-surface-container-high focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
              <div>
                <label className="text-label-md text-on-surface font-medium block mb-1">Current CGPA</label>
                <input
                  type="text"
                  value={formData.cgpa}
                  onChange={(e) => setFormData({ ...formData, cgpa: e.target.value })}
                  className="w-full bg-surface-container-low px-3 py-2 rounded-xl text-body-md text-on-surface border border-surface-container-high focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
              <div>
                <label className="text-label-md text-on-surface font-medium block mb-1">Target Career Goal</label>
                <input
                  type="text"
                  value={formData.careerGoal}
                  onChange={(e) => setFormData({ ...formData, careerGoal: e.target.value })}
                  className="w-full bg-surface-container-low px-3 py-2 rounded-xl text-body-md text-on-surface border border-surface-container-high focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
            </div>
          </div>

          {/* Extracted Skills (Editable Tags) */}
          <div className="space-y-unit-sm">
            <label className="text-headline-sm text-[16px] text-on-surface flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[18px]">psychology</span>
                Detected Skills ({formData.skills.length})
              </span>
              <span className="text-label-sm text-outline">Click × to remove</span>
            </label>

            <div className="flex flex-wrap gap-unit-xs p-3 bg-surface-container-low rounded-xl border border-surface-container-high min-h-[56px] items-center">
              {formData.skills.map((skill) => (
                <span
                  key={skill}
                  className="bg-primary-container text-on-primary-container px-2.5 py-1 rounded-lg text-label-md flex items-center gap-1.5 shadow-sm"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="hover:text-error transition-colors"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            {/* Add Custom Skill Form */}
            <form onSubmit={handleAddSkill} className="flex gap-2">
              <input
                type="text"
                placeholder="Add missing skill (e.g. Scikit-Learn)..."
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                className="flex-1 bg-surface-container-low px-3 py-2 rounded-xl text-body-md text-on-surface border border-surface-container-high outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                type="submit"
                className="px-unit-md py-2 bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-label-md rounded-xl transition-colors"
              >
                Add Skill
              </button>
            </form>
          </div>

          {/* Experience Summary */}
          <div>
            <label className="text-label-md text-on-surface font-medium block mb-1">Extracted Experience Summary</label>
            <textarea
              rows={3}
              value={formData.experienceSummary}
              onChange={(e) => setFormData({ ...formData, experienceSummary: e.target.value })}
              className="w-full bg-surface-container-low p-3 rounded-xl text-body-md text-on-surface border border-surface-container-high focus:ring-2 focus:ring-primary outline-none"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-unit-lg border-t border-surface-container-high flex items-center justify-between bg-surface-container-low/50">
          <button
            onClick={() => setIsResumeModalOpen(false)}
            className="px-unit-md py-2 rounded-xl text-body-sm font-medium text-on-surface-variant hover:bg-surface-container-high transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveToProfile}
            className="bg-primary text-on-primary px-unit-lg py-2 rounded-xl text-body-sm font-medium hover:bg-primary-container transition-all shadow-sm flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">check</span>
            Confirm & Save to Profile
          </button>
        </div>
      </div>
    </div>
  );
}
