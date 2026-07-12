import { Request, Response, NextFunction } from 'express';
import { ReportsService } from '../services/reports.service.js';

export class ReportsController {
  public static async getKpis(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const { startDate, endDate } = req.query;
      const data = await ReportsService.getKpis(
        startDate as string | undefined,
        endDate as string | undefined
      );
      return res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  public static async getChartsData(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const { startDate, endDate } = req.query;
      const data = await ReportsService.getChartsData(
        startDate as string | undefined,
        endDate as string | undefined
      );
      return res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  public static async getTopCostlyVehicles(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const { startDate, endDate } = req.query;
      const data = await ReportsService.getTopCostlyVehicles(
        startDate as string | undefined,
        endDate as string | undefined
      );
      return res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  public static async getExpenseBreakdown(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const { startDate, endDate } = req.query;
      const data = await ReportsService.getExpenseBreakdown(
        startDate as string | undefined,
        endDate as string | undefined
      );
      return res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  public static async exportCsv(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const { startDate, endDate } = req.query;
      const csv = await ReportsService.getCsvExport(
        startDate as string | undefined,
        endDate as string | undefined
      );
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=reports_export.csv');
      return res.status(200).send(csv);
    } catch (error) {
      next(error);
    }
  }

  public static async exportPdf(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      // TODO: Implement complex PDF rendering using pdfkit/puppeteer when required by business specification.
      // Returning standard simple mock PDF binary streams.
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=reports_export.pdf');
      const dummyPdfContent = Buffer.from('%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [ 3 0 R ] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [ 0 0 612 792 ] /Contents 4 0 R >>\nendobj\n4 0 obj\n<< /Length 50 >>\nstream\nBT /F1 24 Tf 100 700 Td (TransitOps Reports Export Mockup PDF) Tj ET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f\n0000000009 00000 n\n0000000058 00000 n\n0000000121 00000 n\n0000000213 00000 n\ntrailer\n<< /Size 5 >>\nstartxref\n312\n%%EOF\n');
      return res.status(200).send(dummyPdfContent);
    } catch (error) {
      next(error);
    }
  }
}
