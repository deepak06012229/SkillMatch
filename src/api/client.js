const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

class ApiClient {
  constructor() {
    this.token = localStorage.getItem("skillmatch_token") || null;
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem("skillmatch_token", token);
    } else {
      localStorage.removeItem("skillmatch_token");
    }
  }

  async request(endpoint, options = {}) {
    const headers = {
      ...(options.headers || {}),
    };

    if (this.token && !headers["Authorization"]) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }

    if (!(options.body instanceof FormData) && !headers["Content-Type"]) {
      headers["Content-Type"] = "application/json";
    }

    try {
      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });

      if (!res.ok) {
        let errorMsg = `HTTP Error ${res.status}`;
        try {
          const errData = await res.json();
          if (errData.detail) errorMsg = errData.detail;
        } catch (_) {}
        throw new Error(errorMsg);
      }

      return await res.json();
    } catch (err) {
      console.warn(`[API] Error on ${endpoint}:`, err.message);
      throw err;
    }
  }

  // AUTH
  async register(data) {
    const res = await this.request("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
    if (res.access_token) this.setToken(res.access_token);
    return res;
  }

  async login(data) {
    const res = await this.request("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    });
    if (res.access_token) this.setToken(res.access_token);
    return res;
  }

  async googleAuth(data) {
    const res = await this.request("/auth/google", {
      method: "POST",
      body: JSON.stringify(data),
    });
    if (res.access_token) this.setToken(res.access_token);
    return res;
  }

  async getMe() {
    return await this.request("/auth/me");
  }

  // PROFILE
  async getProfile() {
    return await this.request("/profile");
  }

  async updateProfile(data) {
    return await this.request("/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async patchProfile(data) {
    return await this.request("/profile", {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async updatePreferences(data) {
    return await this.request("/profile/preferences", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async uploadAvatar(file) {
    const formData = new FormData();
    formData.append("file", file);
    return await this.request("/profile/avatar", {
      method: "POST",
      body: formData,
    });
  }

  // EDUCATION
  async getEducations() {
    return await this.request("/profile/education");
  }

  async addEducation(data) {
    return await this.request("/profile/education", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateEducation(id, data) {
    return await this.request(`/profile/education/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteEducation(id) {
    return await this.request(`/profile/education/${id}`, {
      method: "DELETE",
    });
  }

  // EXPERIENCE
  async getExperiences() {
    return await this.request("/profile/experience");
  }

  async addExperience(data) {
    return await this.request("/profile/experience", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateExperience(id, data) {
    return await this.request(`/profile/experience/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteExperience(id) {
    return await this.request(`/profile/experience/${id}`, {
      method: "DELETE",
    });
  }

  // PROJECTS
  async getProjects() {
    return await this.request("/profile/projects");
  }

  async addProject(data) {
    return await this.request("/profile/projects", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateProject(id, data) {
    return await this.request(`/profile/projects/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteProject(id) {
    return await this.request(`/profile/projects/${id}`, {
      method: "DELETE",
    });
  }

  // CERTIFICATIONS
  async getCertifications() {
    return await this.request("/profile/certifications");
  }

  async addCertification(data) {
    return await this.request("/profile/certifications", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async deleteCertification(id) {
    return await this.request(`/profile/certifications/${id}`, {
      method: "DELETE",
    });
  }

  // RESUME
  async uploadResume(file) {
    const formData = new FormData();
    formData.append("file", file);
    return await this.request("/resume/upload", {
      method: "POST",
      body: formData,
    });
  }

  async confirmResume(resumeId, data) {
    return await this.request(`/resume/confirm/${resumeId}`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // SKILLS
  async getMySkills() {
    return await this.request("/skills/my");
  }

  async addSkill(data) {
    return await this.request("/skills/my", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateSkill(skillId, data) {
    return await this.request(`/skills/my/${skillId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteSkill(skillId) {
    return await this.request(`/skills/my/${skillId}`, {
      method: "DELETE",
    });
  }

  // OPPORTUNITIES
  async getOpportunities(params = {}) {
    const q = new URLSearchParams();
    if (params.category && params.category !== "all") q.append("category", params.category);
    if (params.search) q.append("search", params.search);
    if (params.workplace && params.workplace !== "all") q.append("workplace", params.workplace);
    if (params.verified_only) q.append("verified_only", "true");
    if (params.min_stipend) q.append("min_stipend", params.min_stipend);

    const queryStr = q.toString() ? `?${q.toString()}` : "";
    return await this.request(`/opportunities${queryStr}`);
  }

  async getOpportunitiesByCategory(category, limit = 20) {
    return await this.request(`/opportunities/categories/${category}?limit=${limit}`);
  }

  async getOpportunity(id) {
    return await this.request(`/opportunities/${id}`);
  }

  async createOpportunity(data) {
    return await this.request("/opportunities", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async refreshOpportunities() {
    return await this.request("/opportunities/refresh", {
      method: "POST",
    });
  }

  // MATCHES
  async getMatches(params = {}) {
    const q = new URLSearchParams();
    if (params.min_fit) q.append("min_fit", params.min_fit);
    if (params.eligible_only) q.append("eligible_only", "true");
    if (params.category && params.category !== "all") q.append("category", params.category);

    const queryStr = q.toString() ? `?${q.toString()}` : "";
    return await this.request(`/matches${queryStr}`);
  }

  async getMatchDetail(opportunityId) {
    return await this.request(`/matches/${opportunityId}`);
  }

  async recalculateMatches() {
    return await this.request("/matches/recalculate", {
      method: "POST",
    });
  }

  // SKILL GAPS
  async getSkillGaps() {
    return await this.request("/skill-gaps");
  }

  // ROADMAP
  async getRoadmap() {
    return await this.request("/roadmap");
  }

  async toggleRoadmapChecklist(weekNumber, itemId) {
    return await this.request("/roadmap/toggle", {
      method: "POST",
      body: JSON.stringify({ week_number: weekNumber, item_id: itemId }),
    });
  }

  // APPLICATIONS
  async getApplications() {
    return await this.request("/applications");
  }

  async applyToOpportunity(oppId, notes) {
    return await this.request("/applications", {
      method: "POST",
      body: JSON.stringify({ opportunity_id: oppId, notes }),
    });
  }

  async updateApplicationStatus(appId, status) {
    return await this.request(`/applications/${appId}/status`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    });
  }

  // SAVED
  async getSaved() {
    return await this.request("/saved");
  }

  async toggleSaved(oppId) {
    return await this.request(`/saved/toggle/${oppId}`, {
      method: "POST",
    });
  }

  // FEEDBACK
  async submitFeedback(data) {
    return await this.request("/feedback", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }
}

export const api = new ApiClient();
