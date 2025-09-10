export function parseAmount(amountStr: string) {
  return parseFloat(
    amountStr
      .trim()
      .replace(/[+-]/g, '') 
      .replace(/\./g, '')   
      .replace(',', '.')    
  );
}
