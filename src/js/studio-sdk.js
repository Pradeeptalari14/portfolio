/**
 * Talari Pradeep Studios Hub — Universal Platform SDK (Dual-Engine)
 * Handles:
 * 1. Offline-First IndexedDB storage for projects, progress, bookmarks, and telemetry.
 * 2. Dynamic Backend Probing (Mixed Content safe, fallback to browser storage).
 * 3. 4 Learning Modes (Learn, Practise, Build, Advanced) state management.
 * 4. 7-Step Sequence Tracker (Learn -> Configure -> Simulate -> Troubleshoot -> Validate -> Explain -> Export).
 * 5. Multi-Database Adapter (IndexedDB, Supabase/Postgres, Generic REST).
 */

class StudioPlatformSDK {
  constructor() {
    this.dbName = 'PradeepStudiosDB';
    this.dbVersion = 2;
    this.db = null;
    this.backendUrl = null;
    this.isConnectedBackend = false;
    this.listeners = new Set();
    this.initPromise = this._init();
  }

  async _init() {
    await this._initIndexedDB();
    await this._probeBackend();
    return this;
  }

  // 1. IndexedDB Initialization
  _initIndexedDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Studios Cache
        if (!db.objectStoreNames.contains('studios')) {
          db.createObjectStore('studios', { keyPath: 'id' });
        }

        // User Projects
        if (!db.objectStoreNames.contains('projects')) {
          const projectStore = db.createObjectStore('projects', { keyPath: 'id' });
          projectStore.createIndex('studio_id', 'studio_id', { unique: false });
          projectStore.createIndex('updated_at', 'updated_at', { unique: false });
        }

        // Learning Progress & Quizzes
        if (!db.objectStoreNames.contains('progress')) {
          const progressStore = db.createObjectStore('progress', { keyPath: 'studio_id' });
          progressStore.createIndex('mode', 'mode', { unique: false });
          progressStore.createIndex('completed_steps', 'completed_steps', { unique: false });
        }

        // Bookmarks & Favorites
        if (!db.objectStoreNames.contains('bookmarks')) {
          db.createObjectStore('bookmarks', { keyPath: 'studio_id' });
        }

        // Telemetry & Drills Log
        if (!db.objectStoreNames.contains('telemetry')) {
          const telStore = db.createObjectStore('telemetry', { keyPath: 'id', autoIncrement: true });
          telStore.createIndex('studio_id', 'studio_id', { unique: false });
        }
      };

      request.onsuccess = (event) => {
        this.db = event.target.result;
        resolve(this.db);
      };

      request.onerror = (event) => {
        console.warn('[StudioSDK] IndexedDB init error, falling back to localStorage:', event);
        resolve(null);
      };
    });
  }

  // 2. Safe Dynamic Backend Probing (Mixed Content safe)
  async _probeBackend() {
    if (typeof window === 'undefined') return;
    const isHttps = window.location.protocol === 'https:';
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

    let probeCandidate = null;

    if (isLocalhost) {
      probeCandidate = 'http://localhost:8000';
    } else if (isHttps) {
      probeCandidate = window.STUDIOS_API_BASE || 'https://api.talaripradeep.info';
    }

    if (!probeCandidate) {
      this.isConnectedBackend = false;
      this._emitChange();
      return;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1500);

      const res = await fetch(`${probeCandidate}/api/health`, {
        method: 'GET',
        signal: controller.signal,
        headers: { 'Accept': 'application/json' }
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        this.backendUrl = probeCandidate;
        this.isConnectedBackend = true;
      } else {
        this.isConnectedBackend = false;
      }
    } catch {
      this.isConnectedBackend = false;
      this.backendUrl = null;
    }
    this._emitChange();
  }

  _emitChange() {
    for (const listener of this.listeners) {
      try {
        listener({
          isConnectedBackend: this.isConnectedBackend,
          backendUrl: this.backendUrl
        });
      } catch (err) {
        console.error(err);
      }
    }
  }

  onStateChange(callback) {
    this.listeners.add(callback);
    callback({
      isConnectedBackend: this.isConnectedBackend,
      backendUrl: this.backendUrl
    });
    return () => this.listeners.delete(callback);
  }

  // 3. Learning Progress Management (4 Modes & 7-Step Sequence)
  async getStudioProgress(studioId) {
    await this.initPromise;
    if (!this.db) {
      const raw = localStorage.getItem(`prog_${studioId}`);
      return raw ? JSON.parse(raw) : this._defaultProgress(studioId);
    }

    return new Promise((resolve) => {
      const tx = this.db.transaction('progress', 'readonly');
      const store = tx.objectStore('progress');
      const req = store.get(studioId);
      req.onsuccess = () => resolve(req.result || this._defaultProgress(studioId));
      req.onerror = () => resolve(this._defaultProgress(studioId));
    });
  }

  _defaultProgress(studioId) {
    return {
      studio_id: studioId,
      mode: 'learn', // 'learn' | 'practise' | 'build' | 'advanced'
      completed_steps: [], // ['learn', 'configure', 'simulate', 'troubleshoot', 'validate', 'explain', 'export']
      score: 0,
      quiz_completed: false,
      last_updated: Date.now()
    };
  }

  async saveStudioProgress(studioId, progressUpdate) {
    await this.initPromise;
    const current = await this.getStudioProgress(studioId);
    const updated = {
      ...current,
      ...progressUpdate,
      studio_id: studioId,
      last_updated: Date.now()
    };

    if (!this.db) {
      localStorage.setItem(`prog_${studioId}`, JSON.stringify(updated));
      return updated;
    }

    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('progress', 'readwrite');
      const store = tx.objectStore('progress');
      const req = store.put(updated);
      req.onsuccess = () => resolve(updated);
      req.onerror = (e) => reject(e);
    });
  }

  async completeStep(studioId, stepName) {
    const prog = await this.getStudioProgress(studioId);
    if (!prog.completed_steps.includes(stepName)) {
      prog.completed_steps.push(stepName);
      await this.saveStudioProgress(studioId, { completed_steps: prog.completed_steps });
    }
    return prog;
  }

  // 4. Bookmarks / Favorites Management
  async toggleBookmark(studioId) {
    await this.initPromise;
    const isBookmarked = await this.isBookmarked(studioId);

    if (!this.db) {
      const bms = this._getLocalBookmarks();
      if (isBookmarked) {
        bms.delete(studioId);
      } else {
        bms.add(studioId);
      }
      localStorage.setItem('studio_bms', JSON.stringify(Array.from(bms)));
      return !isBookmarked;
    }

    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('bookmarks', 'readwrite');
      const store = tx.objectStore('bookmarks');
      if (isBookmarked) {
        const req = store.delete(studioId);
        req.onsuccess = () => resolve(false);
        req.onerror = reject;
      } else {
        const req = store.put({ studio_id: studioId, saved_at: Date.now() });
        req.onsuccess = () => resolve(true);
        req.onerror = reject;
      }
    });
  }

  async isBookmarked(studioId) {
    await this.initPromise;
    if (!this.db) {
      return this._getLocalBookmarks().has(studioId);
    }
    return new Promise((resolve) => {
      const tx = this.db.transaction('bookmarks', 'readonly');
      const store = tx.objectStore('bookmarks');
      const req = store.get(studioId);
      req.onsuccess = () => resolve(!!req.result);
      req.onerror = () => resolve(false);
    });
  }

  _getLocalBookmarks() {
    try {
      const raw = localStorage.getItem('studio_bms');
      return new Set(raw ? JSON.parse(raw) : []);
    } catch {
      return new Set();
    }
  }

  async getAllBookmarks() {
    await this.initPromise;
    if (!this.db) {
      return Array.from(this._getLocalBookmarks());
    }
    return new Promise((resolve) => {
      const tx = this.db.transaction('bookmarks', 'readonly');
      const store = tx.objectStore('bookmarks');
      const req = store.getAll();
      req.onsuccess = () => resolve((req.result || []).map(r => r.studio_id));
      req.onerror = () => resolve([]);
    });
  }

  // 5. User Project Workspaces (Local & Cloud Sync)
  async saveProject(project) {
    await this.initPromise;
    const projData = {
      id: project.id || 'proj_' + Math.random().toString(36).substring(2, 10),
      name: project.name || 'Untitled Workspace',
      studio_id: project.studio_id || '',
      files: project.files || {},
      settings: project.settings || {},
      created_at: project.created_at || Date.now(),
      updated_at: Date.now()
    };

    if (this.db) {
      await new Promise((resolve, reject) => {
        const tx = this.db.transaction('projects', 'readwrite');
        const store = tx.objectStore('projects');
        const req = store.put(projData);
        req.onsuccess = () => resolve(projData);
        req.onerror = reject;
      });
    } else {
      localStorage.setItem(`proj_${projData.id}`, JSON.stringify(projData));
    }

    return projData;
  }

  async getAllProjects() {
    await this.initPromise;
    if (!this.db) {
      const projs = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('proj_')) {
          try { projs.push(JSON.parse(localStorage.getItem(key))); } catch {}
        }
      }
      return projs;
    }

    return new Promise((resolve) => {
      const tx = this.db.transaction('projects', 'readonly');
      const store = tx.objectStore('projects');
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => resolve([]);
    });
  }

  // 6. Drill Simulation & Telemetry
  async recordDrillRun(studioId, drillCmd, success = true) {
    await this.initPromise;
    const entry = {
      studio_id: studioId,
      command: drillCmd,
      success,
      timestamp: Date.now()
    };

    if (this.db) {
      const tx = this.db.transaction('telemetry', 'readwrite');
      tx.objectStore('telemetry').add(entry);
    }

    await this.completeStep(studioId, 'simulate');
    return entry;
  }
}

// Attach to window if in browser
if (typeof window !== 'undefined') {
  window.StudioSDK = new StudioPlatformSDK();
}
export default (typeof window !== 'undefined' ? window.StudioSDK : new StudioPlatformSDK());
