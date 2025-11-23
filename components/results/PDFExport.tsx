'use client';

import { useState } from 'react';
import { Download, FileText } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface PDFExportProps {
  analysisData: {
    mlRiskScore: number;
    riskFactors: string[];
    aureliaAnalysis: string;
    biomarkers: Record<string, number>;
    context: {
      age: number;
      cycle_status: string;
      symptoms: string[];
      goals: string[];
    };
  };
}

export default function PDFExport({ analysisData }: PDFExportProps) {
  const [isExporting, setIsExporting] = useState(false);

  const exportToPDF = async () => {
    setIsExporting(true);

    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      let yPosition = margin;

      // Helper function to add text with word wrap
      const addText = (text: string, fontSize: number = 12, isBold: boolean = false) => {
        pdf.setFontSize(fontSize);
        pdf.setFont('helvetica', isBold ? 'bold' : 'normal');
        const lines = pdf.splitTextToSize(text, pageWidth - 2 * margin);

        lines.forEach((line: string) => {
          if (yPosition > pageHeight - margin) {
            pdf.addPage();
            yPosition = margin;
          }
          pdf.text(line, margin, yPosition);
          yPosition += fontSize * 0.5;
        });
        yPosition += 5;
      };

      // Header
      pdf.setFillColor(147, 51, 234); // Purple
      pdf.rect(0, 0, pageWidth, 40, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(24);
      pdf.setFont('helvetica', 'bold');
      pdf.text('AURELIA', margin, 25);
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Women\'s Health Intelligence Report', margin, 33);

      yPosition = 50;
      pdf.setTextColor(0, 0, 0);

      // Date
      const date = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      addText(`Report Generated: ${date}`, 10);
      yPosition += 5;

      // Health Score
      pdf.setFillColor(243, 244, 246);
      pdf.roundedRect(margin, yPosition, pageWidth - 2 * margin, 30, 3, 3, 'F');
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Health Score', margin + 5, yPosition + 10);
      pdf.setFontSize(32);

      // Color based on score
      const score = analysisData.mlRiskScore;
      if (score >= 80) pdf.setTextColor(16, 185, 129);
      else if (score >= 60) pdf.setTextColor(59, 130, 246);
      else if (score >= 40) pdf.setTextColor(245, 158, 11);
      else pdf.setTextColor(239, 68, 68);

      pdf.text(`${score}/100`, pageWidth - margin - 40, yPosition + 22);
      pdf.setTextColor(0, 0, 0);
      yPosition += 40;

      // Risk Factors
      if (analysisData.riskFactors.length > 0) {
        addText('Risk Factors', 16, true);
        analysisData.riskFactors.forEach((factor) => {
          const formatted = factor.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
          addText(`• ${formatted}`, 11);
        });
        yPosition += 5;
      }

      // Biomarkers
      addText('Your Biomarkers', 16, true);
      Object.entries(analysisData.biomarkers).forEach(([name, value]) => {
        addText(`${name}: ${value}`, 11);
      });
      yPosition += 5;

      // Context
      addText('Health Profile', 16, true);
      addText(`Age: ${analysisData.context.age}`, 11);
      addText(`Cycle Status: ${analysisData.context.cycle_status.replace(/_/g, ' ')}`, 11);

      if (analysisData.context.symptoms.length > 0) {
        addText(`Symptoms: ${analysisData.context.symptoms.join(', ')}`, 11);
      }

      if (analysisData.context.goals.length > 0) {
        addText(`Goals: ${analysisData.context.goals.join(', ')}`, 11);
      }
      yPosition += 10;

      // AURELIA Analysis
      pdf.addPage();
      yPosition = margin;
      addText('AURELIA Analysis', 18, true);
      yPosition += 5;

      // Parse markdown-style analysis
      const sections = analysisData.aureliaAnalysis.split('###');
      sections.forEach((section) => {
        if (section.trim()) {
          const lines = section.trim().split('\n');
          const title = lines[0].trim();
          const content = lines.slice(1).join('\n').trim();

          if (title) {
            addText(title, 14, true);
          }
          if (content) {
            // Remove markdown formatting
            const cleanContent = content
              .replace(/\*\*(.*?)\*\*/g, '$1')
              .replace(/\*(.*?)\*/g, '$1')
              .replace(/^[*-]\s+/gm, '• ');
            addText(cleanContent, 11);
          }
          yPosition += 5;
        }
      });

      // Footer on last page
      pdf.setFontSize(8);
      pdf.setTextColor(128, 128, 128);
      pdf.text(
        'This analysis is for informational purposes only and does not constitute medical advice.',
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      );

      // Save PDF
      pdf.save(`AURELIA-Health-Report-${date.replace(/\s/g, '-')}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const exportAsText = () => {
    const date = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    let content = `AURELIA - Women's Health Intelligence Report\n`;
    content += `Generated: ${date}\n`;
    content += `${'='.repeat(60)}\n\n`;

    content += `HEALTH SCORE: ${analysisData.mlRiskScore}/100\n\n`;

    if (analysisData.riskFactors.length > 0) {
      content += `RISK FACTORS:\n`;
      analysisData.riskFactors.forEach((factor) => {
        const formatted = factor.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        content += `• ${formatted}\n`;
      });
      content += `\n`;
    }

    content += `YOUR BIOMARKERS:\n`;
    Object.entries(analysisData.biomarkers).forEach(([name, value]) => {
      content += `${name}: ${value}\n`;
    });
    content += `\n`;

    content += `HEALTH PROFILE:\n`;
    content += `Age: ${analysisData.context.age}\n`;
    content += `Cycle Status: ${analysisData.context.cycle_status.replace(/_/g, ' ')}\n`;
    if (analysisData.context.symptoms.length > 0) {
      content += `Symptoms: ${analysisData.context.symptoms.join(', ')}\n`;
    }
    if (analysisData.context.goals.length > 0) {
      content += `Goals: ${analysisData.context.goals.join(', ')}\n`;
    }
    content += `\n`;

    content += `${'='.repeat(60)}\n\n`;
    content += `AURELIA ANALYSIS:\n\n`;
    content += analysisData.aureliaAnalysis
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1');

    content += `\n\n${'='.repeat(60)}\n`;
    content += `This analysis is for informational purposes only and does not constitute medical advice.\n`;
    content += `Always consult with qualified healthcare professionals before making any changes to your health regimen.\n`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AURELIA-Health-Report-${date.replace(/\s/g, '-')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex gap-3">
      <button
        onClick={exportToPDF}
        disabled={isExporting}
        className="flex items-center gap-2 px-6 py-3 gradient-aurelia-lime text-aurelia-purple rounded-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isExporting ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-aurelia-purple"></div>
            <span>Generating PDF...</span>
          </>
        ) : (
          <>
            <Download className="w-5 h-5" />
            <span>Export as PDF</span>
          </>
        )}
      </button>

      <button
        onClick={exportAsText}
        className="flex items-center gap-2 px-6 py-3 bg-transparent border-2 border-aurelia-lime text-aurelia-lime rounded-xl font-semibold hover:bg-aurelia-lime/10 transition-colors"
      >
        <FileText className="w-5 h-5" />
        <span>Export as Text</span>
      </button>
    </div>
  );
}
