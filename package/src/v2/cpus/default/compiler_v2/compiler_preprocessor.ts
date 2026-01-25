
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

interface ParsedFile {
    textSection: string[];
    dataSection: string[];
    bssSection: string[];
    otherLines: string[];
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
    //console.log('resolvedSource:\n' + resolvedSource)

    return {
        source: resolvedSource,
        stats: context.stats,
    };
}



async function processIncludes(source: string, context: IncludeContext): Promise<string> {

    //const allParsedFiles: ParsedFile[] = [];
    //allParsedFiles.push(mainFile)

    const result = await parseFilesRecursive(source, context);

    const sectionsContent: string[] = [];
    let hasContent = false;

    if (result.otherLines.length > 0) {
        if (hasContent) sectionsContent.push("\n\n");
        sectionsContent.push(...result.otherLines);
        hasContent = true;
    }

    if (result.textSection.length > 0) {
        if (hasContent) sectionsContent.push("\n\n");
        sectionsContent.push("section .text");
        sectionsContent.push(...result.textSection);
        hasContent = true;
    }

    if (result.dataSection.length > 0) {
        if (hasContent) sectionsContent.push("\n\n");
        sectionsContent.push("section .data");
        sectionsContent.push(...result.dataSection);
        hasContent = true;
    }

    if (result.bssSection.length > 0) {
        if (hasContent) sectionsContent.push("\n\n");
        sectionsContent.push("section .bss");
        sectionsContent.push(...result.bssSection);
        hasContent = true;
    }


    const content = sectionsContent.join('\n');

    return content;
}


async function parseFilesRecursive(source: string, context: IncludeContext): Promise<ParsedFile> {
    const lines = source.split('\n');

    const currentParsedFile: ParsedFile = {
        textSection: [],
        dataSection: [],
        bssSection: [],
        otherLines: [],
    };

    // Parser le fichier principal
    const mainFile = parseFileSections(lines);

    // Append each section content
    Object.keys(mainFile).forEach((key) => {
        const sectionContent = mainFile[key as keyof ParsedFile];

        if (sectionContent.length > 0) {
            sectionContent.unshift(`; === ${context.currentPath} ${key} ===`)

            currentParsedFile[key as keyof ParsedFile].push(...sectionContent)
        }
    })


    // Parser les otherLines pour trouver les includes
    const includeLines = mainFile.otherLines.filter(line =>
        line.trim().match(/^\s*\.?include\s+["']([^"']+)["']/i)
    );

    // Traiter chaque include
    for (const line of includeLines) {
        const includeMatch = line.trim().match(/^\s*\.?include\s+["']([^"']+)["']/i);

        if (!includeMatch) continue;

        const includePath = includeMatch[1];
        const normalizedPath = normalizePath(includePath);

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

        if (context.loadedFiles.has(normalizedPath)) {
            continue;
        }

        const includedSource = await loadSourceCodeFromFile(includePath);
        if (!includedSource) {
            throw new Error(`Failed to load include file: ${includePath}`);
        }

        context.loadedFiles.add(normalizedPath);

        const prevPath = context.currentPath;
        context.currentPath = includePath;

        // Parse file (recursive)
        const includedFile = await parseFilesRecursive(includedSource, context);

        // Append each section content
        Object.keys(includedFile).forEach((key) => {
            currentParsedFile[key as keyof ParsedFile].push(...includedFile[key as keyof ParsedFile])
        })

        context.currentPath = prevPath;

    }

    return currentParsedFile;
}


async function processIncludes_OLD(source: string, context: IncludeContext): Promise<string> {
    const lines = source.split('\n');
    const allTextSections: string[] = [];
    const allDataSections: string[] = [];
    const allBssSections: string[] = [];

    // Parser le fichier principal
    const mainFile = parseFileSections(lines);

    // Ajouter les sections du main EN PREMIER
    if (mainFile.textSection.length > 0) {
        allTextSections.push(`; === ${context.currentPath} .text ===`);
        allTextSections.push(...mainFile.textSection);
    }
    if (mainFile.dataSection.length > 0) {
        allDataSections.push(`; === ${context.currentPath} .data ===`);
        allDataSections.push(...mainFile.dataSection);
    }
    if (mainFile.bssSection.length > 0) {
        allBssSections.push(`; === ${context.currentPath} .bss ===`);
        allBssSections.push(...mainFile.bssSection);
    }

    // Parser les otherLines pour trouver les includes
    const includeLines = mainFile.otherLines.filter(line =>
        line.trim().match(/^\s*\.?include\s+["']([^"']+)["']/i)
    );

    // Traiter chaque include
    for (const line of includeLines) {
        const includeMatch = line.trim().match(/^\s*\.?include\s+["']([^"']+)["']/i);

        if (!includeMatch) continue;

        const includePath = includeMatch[1];
        const normalizedPath = normalizePath(includePath);

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

        if (context.loadedFiles.has(normalizedPath)) {
            continue;
        }

        const includedSource = await loadSourceCodeFromFile(includePath);
        if (!includedSource) {
            throw new Error(`Failed to load include file: ${includePath}`);
        }

        context.loadedFiles.add(normalizedPath);

        const prevPath = context.currentPath;
        context.currentPath = includePath;
        const processedInclude = await processIncludes(includedSource, context);
        context.currentPath = prevPath;

        // Parser le résultat de l'include
        const includeResultLines = processedInclude.split('\n');
        const includedFile = parseFileSections(includeResultLines);

        if (includedFile.textSection.length > 0) {
            allTextSections.push(...includedFile.textSection);
        }
        if (includedFile.dataSection.length > 0) {
            allDataSections.push(...includedFile.dataSection);
        }
        if (includedFile.bssSection.length > 0) {
            allBssSections.push(...includedFile.bssSection);
        }
    }

    // Reconstruire le fichier avec sections regroupées
    const result: string[] = [];

    if (allTextSections.length > 0) {
        result.push('section .text');
        result.push(...allTextSections);
        result.push('');
    }

    if (allDataSections.length > 0) {
        result.push('section .data');
        result.push(...allDataSections);
        result.push('');
    }

    if (allBssSections.length > 0) {
        result.push('section .bss');
        result.push(...allBssSections);
    }

    return result.join('\n');
}


function parseFileSections(lines: string[]): ParsedFile {
    const result: ParsedFile = {
        textSection: [],
        dataSection: [],
        bssSection: [],
        otherLines: []
    };

    let currentSection: 'text' | 'data' | 'bss' | 'none' = 'none';

    for (const line of lines) {
        const trimmed = line.trim();

        // Détecter changement de section
        if (trimmed.match(/^\s*section\s+\.text/i) || trimmed.match(/^\s*\.text/i)) {
            currentSection = 'text';
            continue;

        } else if (trimmed.match(/^\s*section\s+\.data/i) || trimmed.match(/^\s*\.data/i)) {
            currentSection = 'data';
            continue;

        } else if (trimmed.match(/^\s*section\s+\.bss/i) || trimmed.match(/^\s*\.bss/i)) {
            currentSection = 'bss';
            continue;
        }

        // Ignorer les lignes vides et commentaires seuls
        if (!trimmed || trimmed.startsWith(';')) {
            continue;
        }

        // Router vers la bonne section
        if (currentSection === 'text') {
            result.textSection.push(line);

        } else if (currentSection === 'data') {
            result.dataSection.push(line);

        } else if (currentSection === 'bss') {
            result.bssSection.push(line);

        } else {
            result.otherLines.push(line);
        }
    }

    return result;
}


function normalizePath(path: string): string {
    return path
        .replace(/\\/g, '/')
        .replace(/\/+/g, '/')
        .toLowerCase();
}
