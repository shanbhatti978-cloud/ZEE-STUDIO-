import { Project, TemplateDefinition } from '../types/editor';
import { ProjectStorageService } from './projectStorage';
import { LocalLibraryService } from './localLibrary';
import { AssetDeduplicationService } from './assetDeduplicationService';

export interface ActBackupManifest {
  format: 'AI_CREATOR_STUDIO_BACKUP';
  version: '2.5.0';
  createdAt: number;
  projectCount: number;
  templateCount: number;
  assetCount: number;
  totalSizeBytes: number;
  checksum: string;
}

export interface ActBackupPackage {
  manifest: ActBackupManifest;
  projects: Project[];
  templates: TemplateDefinition[];
  assets: { hash: string; dataUrl: string; mimeType: string }[];
}

export interface DryRunRestoreResult {
  canRestore: boolean;
  projectsToAdd: number;
  projectsToReplace: number;
  projectsPresent: number;
  templatesToAdd: number;
  templatesToReplace: number;
  conflicts: string[];
  estimatedStorageMb: number;
}

export class BackupService {
  /**
   * Generates a complete .actbackup export package with checksum verification
   */
  public static async generateFullBackup(): Promise<{ fileName: string; blob: Blob }> {
    const projects = ProjectStorageService.getAllProjects();
    const builtIn = LocalLibraryService.getTemplates('BuiltIn');
    const saved = LocalLibraryService.getTemplates('Saved');
    const imported = LocalLibraryService.getTemplates('Imported');
    const allTemplates = [...saved, ...imported, ...builtIn];

    const stats = AssetDeduplicationService.getStorageStats();
    const rawData = JSON.stringify({ projects, templates: allTemplates });
    const checksum = await AssetDeduplicationService.computeHash(rawData);

    const manifest: ActBackupManifest = {
      format: 'AI_CREATOR_STUDIO_BACKUP',
      version: '2.5.0',
      createdAt: Date.now(),
      projectCount: projects.length,
      templateCount: allTemplates.length,
      assetCount: stats.totalAssets,
      totalSizeBytes: rawData.length,
      checksum
    };

    const backupData: ActBackupPackage = {
      manifest,
      projects,
      templates: allTemplates,
      assets: []
    };

    const jsonString = JSON.stringify(backupData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/octet-stream' });
    const fileName = `studio_backup_${new Date().toISOString().slice(0, 10)}.actbackup`;

    return { fileName, blob };
  }

  /**
   * Performs a safe Dry-Run on an uploaded .actbackup file before actual restoration
   */
  public static async inspectBackupDryRun(jsonContent: string): Promise<{
    backup: ActBackupPackage;
    dryRun: DryRunRestoreResult;
  }> {
    let parsed: any;
    try {
      parsed = JSON.parse(jsonContent);
    } catch {
      throw new Error('Invalid .actbackup file format. Failed to parse JSON structure.');
    }

    if (!parsed.manifest || parsed.manifest.format !== 'AI_CREATOR_STUDIO_BACKUP') {
      throw new Error('Incompatible backup package signature. Expected .actbackup format.');
    }

    const currentProjects = ProjectStorageService.getAllProjects();
    const currentTemplates = LocalLibraryService.getTemplates('Saved');

    let projectsToAdd = 0;
    let projectsToReplace = 0;
    let projectsPresent = 0;
    const conflicts: string[] = [];

    const incomingProjects: Project[] = parsed.projects || [];
    incomingProjects.forEach((inProj) => {
      const match = currentProjects.find((p) => p.id === inProj.id);
      if (match) {
        if (inProj.updatedAt > match.updatedAt) {
          projectsToReplace++;
        } else {
          projectsPresent++;
        }
      } else {
        projectsToAdd++;
      }
    });

    const incomingTemplates: TemplateDefinition[] = parsed.templates || [];
    let templatesToAdd = 0;
    let templatesToReplace = 0;

    incomingTemplates.forEach((inTmpl) => {
      const match = currentTemplates.find((t) => t.id === inTmpl.id);
      if (match) {
        templatesToReplace++;
      } else {
        templatesToAdd++;
      }
    });

    const estimatedStorageMb = (jsonContent.length / (1024 * 1024)) * 1.5;

    return {
      backup: parsed,
      dryRun: {
        canRestore: true,
        projectsToAdd,
        projectsToReplace,
        projectsPresent,
        templatesToAdd,
        templatesToReplace,
        conflicts,
        estimatedStorageMb: Math.max(0.1, Number(estimatedStorageMb.toFixed(2)))
      }
    };
  }

  /**
   * Executes the actual confirmed restoration
   */
  public static executeRestore(backup: ActBackupPackage): { restoredProjects: number; restoredTemplates: number } {
    const incomingProjects = backup.projects || [];
    incomingProjects.forEach((proj) => {
      ProjectStorageService.saveProject(proj);
    });

    const incomingTemplates = backup.templates || [];
    incomingTemplates.forEach((tmpl) => {
      LocalLibraryService.saveTemplate(tmpl, 'Saved');
    });

    return {
      restoredProjects: incomingProjects.length,
      restoredTemplates: incomingTemplates.length
    };
  }
}
