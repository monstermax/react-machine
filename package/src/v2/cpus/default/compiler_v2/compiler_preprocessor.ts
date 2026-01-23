
import { loadSourceCodeFromFile } from '../../../lib/compilation';


export interface IncludeStats {
    file: string;
    references: number;
    includedBy: string[];
}

export interface ResolveResult {
    source: string;
    stats: Map<string, IncludeStats>;
}

interface IncludeContext {
    currentPath: string;
    loadedFiles: Set<string>;
    stats: Map<string, IncludeStats>;
}


export async function resolveIncludes(
    source: string,
    currentPath: string = 'main.asm'
): Promise<ResolveResult> {
    const context: IncludeContext = {
        currentPath,
        loadedFiles: new Set([normalizePath(currentPath)]),
        stats: new Map()
    };

    const resolvedSource = await processIncludes(source, context);

    return {
        source: resolvedSource,
        stats: context.stats,
    };
}


async function processIncludes(source: string, context: IncludeContext): Promise<string> {
    const lines = source.split('\n');
    const result: string[] = [];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        const includeMatch = line.match(/^\s*\.?include\s+["']([^"']+)["']/i);

        if (includeMatch) {
            const includePath = includeMatch[1];
            const normalizedPath = normalizePath(includePath);

            // Mettre à jour les stats
            if (!context.stats.has(normalizedPath)) {
                context.stats.set(normalizedPath, {
                    file: includePath,
                    references: 0,
                    includedBy: []
                });
            }

            const stats = context.stats.get(normalizedPath)!;
            stats.references++;
            if (!stats.includedBy.includes(context.currentPath)) {
                stats.includedBy.push(context.currentPath);
            }

            // Si déjà inclus, skip (déduplication)
            if (context.loadedFiles.has(normalizedPath)) {
                result.push(`; === SKIPPED (already included): ${includePath} ===`);
                continue;
            }

            // Charger le fichier
            const includedSource = await loadSourceCodeFromFile(includePath);

            if (!includedSource) {
                throw new Error(`Failed to load include file: ${includePath}`);
            }

            // Marquer comme chargé
            context.loadedFiles.add(normalizedPath);

            // Traiter récursivement
            const prevPath = context.currentPath;
            context.currentPath = includePath;
            const processedInclude = await processIncludes(includedSource, context);
            context.currentPath = prevPath;

            result.push(`; === BEGIN INCLUDE: ${includePath} ===`);
            result.push(processedInclude);
            result.push(`; === END INCLUDE: ${includePath} ===`);
        } else {
            result.push(lines[i]);
        }
    }

    return result.join('\n');
}


function normalizePath(path: string): string {
    return path
        .replace(/\\/g, '/')
        .replace(/\/+/g, '/')
        .toLowerCase();
}
