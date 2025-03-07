
import { useState, useRef } from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface DownloadPDFProps {
  decisionTitle: string;
  contentRef: React.RefObject<HTMLDivElement>;
  onDownloadStart?: () => void;
  onDownloadEnd?: () => void;
}

export function DownloadPDF({ 
  decisionTitle, 
  contentRef, 
  onDownloadStart, 
  onDownloadEnd 
}: DownloadPDFProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    if (!contentRef.current) return;
    
    setIsDownloading(true);
    if (onDownloadStart) onDownloadStart();
    toast.info('Préparation du téléchargement...');
    
    try {
      // Wait for the DOM to update
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const canvas = await html2canvas(contentRef.current, {
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: true
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      // Calculate dimensions to fit the image on page
      const imgWidth = 210; // A4 width
      const imgHeight = canvas.height * imgWidth / canvas.width;
      
      // Add title to PDF
      pdf.setFontSize(16);
      pdf.text(`Analyse de décision: ${decisionTitle}`, 10, 10);
      
      // Add image to PDF
      pdf.addImage(imgData, 'PNG', 0, 20, imgWidth, imgHeight);
      
      // Generate filename
      const filename = `decision-${decisionTitle.toLowerCase().replace(/\s+/g, '-')}.pdf`;
      pdf.save(filename);
      
      toast.success('PDF téléchargé avec succès!');
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
      toast.error('Erreur lors de la génération du PDF');
    } finally {
      setIsDownloading(false);
      if (onDownloadEnd) onDownloadEnd();
    }
  };

  return (
    <Button 
      variant="default" 
      onClick={handleDownload} 
      className="gap-2"
      disabled={isDownloading}
    >
      <Download className="h-4 w-4" />
      {isDownloading ? 'Téléchargement...' : 'Download'}
    </Button>
  );
}
