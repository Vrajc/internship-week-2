import jsPDF from 'jspdf';
import { format } from 'date-fns';
import { Classification } from '../contexts/ClassificationContext';
import { MarketplaceItem } from '../contexts/MarketplaceContext';

export const generateUserPDFReport = (
  classifications: Classification[],
  userName: string
): void => {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.setTextColor(34, 197, 94); // Green color
  doc.text('EcoClassify - User Report', 20, 20);
  
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text(`Generated for: ${userName}`, 20, 35);
  doc.text(`Date: ${format(new Date(), 'MMMM dd, yyyy')}`, 20, 45);
  doc.text(`Total Classifications: ${classifications.length}`, 20, 55);
  
  // Summary Statistics
  doc.setFontSize(16);
  doc.text('Summary Statistics', 20, 75);
  
  const categories = classifications.reduce((acc, c) => {
    acc[c.category] = (acc[c.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const hazardousItems = classifications.filter(c => c.hazardousElements.length > 0).length;
  const avgConfidence = classifications.reduce((sum, c) => sum + c.confidence, 0) / classifications.length;
  
  doc.setFontSize(12);
  let yPos = 90;
  doc.text(`• Hazardous Items Identified: ${hazardousItems}`, 25, yPos);
  yPos += 10;
  doc.text(`• Average Confidence: ${avgConfidence.toFixed(1)}%`, 25, yPos);
  yPos += 10;
  doc.text(`• Most Common Category: ${Object.entries(categories).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'}`, 25, yPos);
  
  // Categories Breakdown
  yPos += 20;
  doc.setFontSize(16);
  doc.text('Categories Breakdown', 20, yPos);
  yPos += 15;
  
  doc.setFontSize(12);
  Object.entries(categories).forEach(([category, count]) => {
    doc.text(`• ${category}: ${count} items`, 25, yPos);
    yPos += 10;
  });
  
  // Recent Classifications
  yPos += 10;
  doc.setFontSize(16);
  doc.text('Recent Classifications', 20, yPos);
  yPos += 15;
  
  doc.setFontSize(10);
  classifications.slice(0, 10).forEach((classification, index) => {
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }
    
    doc.text(`${index + 1}. ${classification.objectName}`, 25, yPos);
    yPos += 8;
    doc.text(`   Category: ${classification.category} | Confidence: ${classification.confidence}%`, 30, yPos);
    yPos += 8;
    doc.text(`   Date: ${format(classification.createdAt, 'MMM dd, yyyy')}`, 30, yPos);
    yPos += 12;
  });
  
  // Save the PDF
  doc.save(`EcoClassify_Report_${userName}_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
};

export const generateUserCSVReport = (
  classifications: Classification[],
  userName: string
): void => {
  const headers = [
    'Date',
    'Object Name',
    'Category',
    'Confidence (%)',
    'Hazardous Elements',
    'Element Count'
  ];
  
  const csvData = classifications.map(c => [
    format(c.createdAt, 'yyyy-MM-dd HH:mm:ss'),
    c.objectName,
    c.category,
    c.confidence.toString(),
    c.hazardousElements.join('; '),
    c.hazardousElements.length.toString()
  ]);
  
  const csvContent = [
    headers.join(','),
    ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `EcoClassify_Data_${userName}_${format(new Date(), 'yyyy-MM-dd')}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const generateAdminSystemReport = (
  allClassifications: Classification[],
  marketplaceItems: MarketplaceItem[]
): void => {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.setTextColor(34, 197, 94);
  doc.text('EcoClassify - System Report', 20, 20);
  
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text(`Generated: ${format(new Date(), 'MMMM dd, yyyy HH:mm')}`, 20, 35);
  doc.text('System-wide Analytics Report', 20, 45);
  
  // System Statistics
  doc.setFontSize(16);
  doc.text('System Overview', 20, 65);
  
  const totalUsers = new Set(allClassifications.map(c => c.userId)).size;
  const totalClassifications = allClassifications.length;
  const totalMarketplaceItems = marketplaceItems.length;
  const hazardousItems = allClassifications.filter(c => c.hazardousElements.length > 0).length;
  
  doc.setFontSize(12);
  let yPos = 80;
  doc.text(`• Total Active Users: ${totalUsers}`, 25, yPos);
  yPos += 10;
  doc.text(`• Total Classifications: ${totalClassifications}`, 25, yPos);
  yPos += 10;
  doc.text(`• Marketplace Listings: ${totalMarketplaceItems}`, 25, yPos);
  yPos += 10;
  doc.text(`• Hazardous Items Identified: ${hazardousItems}`, 25, yPos);
  
  // Category Analysis
  yPos += 20;
  doc.setFontSize(16);
  doc.text('Category Distribution', 20, yPos);
  yPos += 15;
  
  const categories = allClassifications.reduce((acc, c) => {
    acc[c.category] = (acc[c.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  doc.setFontSize(12);
  Object.entries(categories)
    .sort((a, b) => b[1] - a[1])
    .forEach(([category, count]) => {
      doc.text(`• ${category}: ${count} items (${((count / totalClassifications) * 100).toFixed(1)}%)`, 25, yPos);
      yPos += 10;
    });
  
  // User Activity
  yPos += 10;
  doc.setFontSize(16);
  doc.text('User Activity Analysis', 20, yPos);
  yPos += 15;
  
  const userActivity = allClassifications.reduce((acc, c) => {
    acc[c.userId] = (acc[c.userId] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const avgClassificationsPerUser = totalClassifications / totalUsers;
  const mostActiveUser = Object.entries(userActivity).sort((a, b) => b[1] - a[1])[0];
  
  doc.setFontSize(12);
  doc.text(`• Average Classifications per User: ${avgClassificationsPerUser.toFixed(1)}`, 25, yPos);
  yPos += 10;
  doc.text(`• Most Active User: User ${mostActiveUser?.[0]} (${mostActiveUser?.[1]} classifications)`, 25, yPos);
  
  // Save the PDF
  doc.save(`EcoClassify_System_Report_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
};

export const generateAdminCSVExport = (
  allClassifications: Classification[],
  marketplaceItems: MarketplaceItem[]
): void => {
  // Classifications CSV
  const classificationHeaders = [
    'ID',
    'User ID',
    'Date',
    'Object Name',
    'Category',
    'Confidence (%)',
    'Hazardous Elements',
    'Element Count'
  ];
  
  const classificationData = allClassifications.map(c => [
    c.id,
    c.userId,
    format(c.createdAt, 'yyyy-MM-dd HH:mm:ss'),
    c.objectName,
    c.category,
    c.confidence.toString(),
    c.hazardousElements.join('; '),
    c.hazardousElements.length.toString()
  ]);
  
  const classificationCSV = [
    classificationHeaders.join(','),
    ...classificationData.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');
  
  // Marketplace CSV
  const marketplaceHeaders = [
    'ID',
    'Seller ID',
    'Seller Name',
    'Title',
    'Price',
    'Category',
    'Condition',
    'Date Listed'
  ];
  
  const marketplaceData = marketplaceItems.map(item => [
    item.id,
    item.sellerId,
    item.sellerName,
    item.title,
    item.price.toString(),
    item.category,
    item.condition,
    format(item.createdAt, 'yyyy-MM-dd HH:mm:ss')
  ]);
  
  const marketplaceCSV = [
    marketplaceHeaders.join(','),
    ...marketplaceData.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');
  
  // Create combined export
  const combinedCSV = `CLASSIFICATIONS DATA\n${classificationCSV}\n\n\nMARKETPLACE DATA\n${marketplaceCSV}`;
  
  const blob = new Blob([combinedCSV], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `EcoClassify_Complete_Export_${format(new Date(), 'yyyy-MM-dd')}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};