const { exportToPdf, exportToExcel } = require('../controllers/exportController');
const PDFDocument = require('pdfkit');
const Excel = require('exceljs');
const { jest } = require('@jest/globals');

// Mock des dépendances
jest.mock('pdfkit');
jest.mock('exceljs');

describe('Export Controller Tests', () => {
    let mockReq;
    let mockRes;

    beforeEach(() => {
        // Reset des mocks avant chaque test
        mockReq = {
            body: {
                data: {
                    stats: {
                        totalStations: 10,
                        activeStations: 8,
                        totalCommandes: 100,
                        commandesEnCours: 25
                    },
                    reclamations: [
                        {
                            idReclamation: 1,
                            type: 'Technique',
                            description: 'Test',
                            etat: 'En cours',
                            date: new Date()
                        }
                    ]
                }
            }
        };

        mockRes = {
            setHeader: jest.fn(),
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            send: jest.fn(),
            end: jest.fn()
        };
    });

    describe('exportToPdf', () => {
        test('should generate PDF with correct data', async () => {
            const mockPipe = jest.fn();
            const mockText = jest.fn().mockReturnThis();
            const mockFontSize = jest.fn().mockReturnThis();

            PDFDocument.mockImplementation(() => ({
                pipe: mockPipe,
                fontSize: mockFontSize,
                text: mockText,
                end: jest.fn()
            }));

            await exportToPdf(mockReq, mockRes);

            expect(mockRes.setHeader).toHaveBeenCalledWith('Content-Type', 'application/pdf');
            expect(mockPipe).toHaveBeenCalledWith(mockRes);
            expect(mockText).toHaveBeenCalled();
        });

        test('should handle error when PDF generation fails', async () => {
            PDFDocument.mockImplementation(() => {
                throw new Error('PDF generation failed');
            });

            await exportToPdf(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(500);
            expect(mockRes.json).toHaveBeenCalledWith({
                message: 'Erreur lors de la génération du PDF'
            });
        });

        test('should handle empty data', async () => {
            mockReq.body.data = { stats: {}, reclamations: [] };
            const mockPipe = jest.fn();
            const mockText = jest.fn().mockReturnThis();
            const mockFontSize = jest.fn().mockReturnThis();

            PDFDocument.mockImplementation(() => ({
                pipe: mockPipe,
                fontSize: mockFontSize,
                text: mockText,
                end: jest.fn()
            }));

            await exportToPdf(mockReq, mockRes);

            expect(mockRes.setHeader).toHaveBeenCalledWith('Content-Type', 'application/pdf');
            expect(mockPipe).toHaveBeenCalledWith(mockRes);
        });
    });

    describe('exportToExcel', () => {
        test('should generate Excel with correct data', async () => {
            const mockAddWorksheet = jest.fn().mockReturnValue({
                columns: [],
                addRows: jest.fn()
            });

            Excel.Workbook.mockImplementation(() => ({
                addWorksheet: mockAddWorksheet,
                xlsx: {
                    writeBuffer: jest.fn().mockResolvedValue(Buffer.from(''))
                }
            }));

            await exportToExcel(mockReq, mockRes);

            expect(mockRes.setHeader).toHaveBeenCalledWith(
                'Content-Type',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            );
            expect(mockAddWorksheet).toHaveBeenCalledWith('Statistiques');
        });

        test('should handle error when Excel generation fails', async () => {
            Excel.Workbook.mockImplementation(() => {
                throw new Error('Excel generation failed');
            });

            await exportToExcel(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(500);
            expect(mockRes.json).toHaveBeenCalledWith({
                message: 'Erreur lors de la génération du fichier Excel'
            });
        });

        test('should handle empty data', async () => {
            mockReq.body.data = { stats: {}, reclamations: [] };
            const mockAddWorksheet = jest.fn().mockReturnValue({
                columns: [],
                addRows: jest.fn()
            });

            Excel.Workbook.mockImplementation(() => ({
                addWorksheet: mockAddWorksheet,
                xlsx: {
                    writeBuffer: jest.fn().mockResolvedValue(Buffer.from(''))
                }
            }));

            await exportToExcel(mockReq, mockRes);

            expect(mockRes.setHeader).toHaveBeenCalledWith(
                'Content-Type',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            );
            expect(mockAddWorksheet).toHaveBeenCalledWith('Statistiques');
        });
    });
});
