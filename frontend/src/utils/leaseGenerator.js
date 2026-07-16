import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generateLeasePDF = ({
  tenantName,
  ownerName,
  propertyName,
  unitNo,
  rentAmount,
  depositAmount,
  startDate,
  tenantSignature
}) => {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(22);
  doc.setTextColor(15, 23, 42); // slate-900
  doc.text('RESIDENTIAL LEASE AGREEMENT', 105, 20, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139); // slate-500
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, 28, { align: 'center' });

  // Divider
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.setLineWidth(0.5);
  doc.line(20, 35, 190, 35);

  // Parties Section
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.text('1. PARTIES', 20, 45);
  
  doc.setFont('helvetica', 'normal');
  const partiesText = `This Residential Lease Agreement ("Agreement") is made and entered into on ${new Date().toLocaleDateString()}, by and between ${ownerName || 'EstateFlow Admin'} ("Landlord") and ${tenantName} ("Tenant").`;
  const splitParties = doc.splitTextToSize(partiesText, 170);
  doc.text(splitParties, 20, 52);

  // Premises Section
  doc.setFont('helvetica', 'bold');
  doc.text('2. PREMISES', 20, 70);
  
  doc.setFont('helvetica', 'normal');
  const premisesText = `The Landlord agrees to lease to the Tenant, and the Tenant agrees to lease from the Landlord, the premises located at ${propertyName}, Unit/Room Number: ${unitNo} ("Premises").`;
  const splitPremises = doc.splitTextToSize(premisesText, 170);
  doc.text(splitPremises, 20, 77);

  // Terms & Financials Table
  doc.setFont('helvetica', 'bold');
  doc.text('3. LEASE TERMS & FINANCIALS', 20, 95);

  autoTable(doc, {
    startY: 100,
    margin: { left: 20, right: 20 },
    headStyles: { fillColor: [59, 130, 246] }, // primary blue
    bodyStyles: { textColor: 50 },
    theme: 'grid',
    head: [['Description', 'Details']],
    body: [
      ['Lease Start Date', new Date(startDate).toLocaleDateString()],
      ['Monthly Rent', `INR ${rentAmount.toLocaleString('en-IN')}`],
      ['Security Deposit', `INR ${depositAmount.toLocaleString('en-IN')}`],
      ['Notice Period', '30 Days'],
      ['Payment Due Date', '1st of every month']
    ],
  });

  // Terms and Conditions
  const finalY = (doc.lastAutoTable?.finalY || 120) + 15;
  doc.setFont('helvetica', 'bold');
  doc.text('4. TERMS AND CONDITIONS', 20, finalY);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  const termsText = `A. The Tenant agrees to pay the monthly rent on or before the due date.
B. The Tenant shall maintain the Premises in good, clean condition.
C. The Security Deposit shall be held by the Landlord to cover any damages to the Premises.
D. Either party may terminate this Agreement by giving a 30-day written notice.`;
  const splitTerms = doc.splitTextToSize(termsText, 170);
  doc.text(splitTerms, 20, finalY + 7);

  // Signatures Section
  const sigY = finalY + 45;
  doc.setDrawColor(226, 232, 240);
  doc.line(20, sigY - 10, 190, sigY - 10);
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('5. SIGNATURES', 20, sigY);
  
  doc.setFont('helvetica', 'normal');
  doc.text('Landlord (Authorized Signatory)', 20, sigY + 10);
  doc.text('Tenant', 120, sigY + 10);

  // Landlord Signature Placeholder (System Generated)
  doc.setFontSize(10);
  doc.setTextColor(156, 163, 175);
  doc.text('Digitally Verified by EstateFlow', 20, sigY + 30);
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, sigY + 35);

  // Tenant Signature (Base64 Image)
  if (tenantSignature) {
    // Check if the signature is valid base64 image
    try {
      doc.addImage(tenantSignature, 'PNG', 120, sigY + 15, 60, 20);
    } catch(e) {
      console.error("Error adding signature image to PDF:", e);
      doc.text('Signed Digitally', 120, sigY + 30);
    }
  } else {
    doc.text('Signed Digitally', 120, sigY + 30);
  }

  doc.text(`Date: ${new Date().toLocaleDateString()}`, 120, sigY + 45);

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(156, 163, 175);
  doc.text('This is a computer generated, legally binding digital document.', 105, 285, { align: 'center' });
  doc.text('Powered by EstateFlow SaaS', 105, 290, { align: 'center' });

  // Save the PDF
  doc.save(`Lease_Agreement_${propertyName.replace(/\s+/g, '_')}_Unit_${unitNo}.pdf`);
  
  // We can also return doc.output('bloburl') if we want to preview it, but downloading is fine.
};
