import { ToolDef, OutputSettings } from '../types';
import { performOCR } from './geminiService';
import { PDFDocument, rgb, degrees, StandardFonts, PageSizes } from 'pdf-lib';
import mammoth from 'mammoth';
import * as XLSX from 'xlsx';
import * as pdfjsLib from 'pdfjs-dist';
import JSZip from 'jszip';

const pdfjs = (pdfjsLib as any).default || pdfjsLib;

const setupPdfWorker = async () => {
    if (typeof window === 'undefined' || !pdfjs) return;
    const workerUrl = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    try {
        pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;
    } catch (e) {
        console.warn("Worker setup warning:", e);
    }
};

setupPdfWorker();

async function convertToEmbeddableImage(file: File): Promise<{ blob: Blob, isPng: boolean, width: number, height: number }> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    reject(new Error('Canvas context not available'));
                    return;
                }
                ctx.drawImage(img, 0, 0);
                let mimeType = (file.type === 'image/jpeg' || file.type === 'image/jpg') ? 'image/jpeg' : 'image/png';
                canvas.toBlob((blob) => {
                    if (blob) resolve({ blob, isPng: mimeType === 'image/png', width: img.width, height: img.height });
                    else reject(new Error('Image conversion failed'));
                }, mimeType, 0.9);
            };
            img.onerror = () => reject(new Error("Failed to load image"));
            img.src = reader.result as string;
        };
        reader.onerror = () => reject(new Error("Failed to read file"));
        reader.readAsDataURL(file);
    });
}

async function convertPdfToJpg(file: File, settings: OutputSettings): Promise<Blob> {
    try {
        const arrayBuffer = await (file as any).arrayBuffer();
        const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;
        const numPages = pdf.numPages;

        const renderPage = async (pageNumber: number): Promise<Blob> => {
            const page = await pdf.getPage(pageNumber);
            const rotation = (page.rotate + settings.rotation) % 360;
            const viewport = page.getViewport({ scale: 2.5, rotation });
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d')!;
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            await page.render({ canvasContext: context, viewport }).promise;

            const qualityMap = { low: 0.5, medium: 0.75, high: 0.95 };
            const quality = qualityMap[settings.imageQuality || 'high'];

            return new Promise((res, rej) => {
                canvas.toBlob((b) => b ? res(b) : rej(new Error("Canvas to Blob failed")), 'image/jpeg', quality);
            });
        };

        if (numPages === 1) return await renderPage(1);

        const zip = new JSZip();
        for (let i = 1; i <= numPages; i++) {
            const blob = await renderPage(i);
            zip.file(`page-${i}.jpg`, blob);
        }
        return await zip.generateAsync({ type: "blob" });
    } catch (e) {
        throw new Error("Failed to convert PDF to JPG. Ensure the file is not corrupted.");
    }
}

async function applyPdfSettings(pdfDoc: PDFDocument, settings: OutputSettings) {
    const pages = pdfDoc.getPages();
    pages.forEach(page => {
        const { width, height } = page.getSize();
        if (settings.rotation !== 0) page.setRotation(degrees(settings.rotation));
        if (settings.addBorder) {
            page.drawRectangle({
                x: 10, y: 10, width: width - 20, height: height - 20,
                borderColor: rgb(0, 0, 0), borderWidth: 2,
            });
        }
    });
}

export const processFile = async (file: File, tool: ToolDef, settings: OutputSettings): Promise<{ blob: Blob, text?: string }> => {
    await new Promise(r => setTimeout(r, 600));

    if (tool.id === 'ocr-pdf') {
        const text = await performOCR(file);
        return { blob: new Blob([text], { type: 'text/plain' }), text };
    }

    if (tool.id === 'pdf-to-jpg') {
        const blob = await convertPdfToJpg(file, settings);
        return { blob };
    }

    // Default basic handling for other tools using pdf-lib
    if (file.type === 'application/pdf') {
        const arrayBuffer = await (file as any).arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        await applyPdfSettings(pdfDoc, settings);
        const pdfBytes = await pdfDoc.save();
        return { blob: new Blob([pdfBytes as any], { type: 'application/pdf' }) };
    }

    // Simple pass-through for unhandled cases
    return { blob: file };
};

export const rotatePdfBlob = async (pdfBlob: Blob, rotationAmount: 90 | 180 | 270): Promise<Blob> => {
    const arrayBuffer = await (pdfBlob as any).arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    pdfDoc.getPages().forEach(p => p.setRotation(degrees((p.getRotation().angle + rotationAmount) % 360)));
    return new Blob([await pdfDoc.save() as any], { type: 'application/pdf' });
};