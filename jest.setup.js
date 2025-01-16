// Mock des modules qui ne sont pas nécessaires pour les tests
jest.mock('pdfkit', () => {
  return jest.fn().mockImplementation(() => ({
    pipe: jest.fn(),
    fontSize: jest.fn().mockReturnThis(),
    text: jest.fn().mockReturnThis(),
    end: jest.fn()
  }));
});

jest.mock('exceljs', () => {
  return {
    Workbook: jest.fn().mockImplementation(() => ({
      addWorksheet: jest.fn().mockReturnValue({
        columns: [],
        addRows: jest.fn()
      }),
      xlsx: {
        writeBuffer: jest.fn().mockResolvedValue(Buffer.from(''))
      }
    }))
  };
});
