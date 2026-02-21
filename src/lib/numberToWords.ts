const ones = [
  '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
  'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
  'Seventeen', 'Eighteen', 'Nineteen'
];

const tens = [
  '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'
];

function convertLessThanThousand(num: number): string {
  if (num === 0) return '';
  
  if (num < 20) {
    return ones[num];
  }
  
  if (num < 100) {
    const ten = Math.floor(num / 10);
    const one = num % 10;
    return tens[ten] + (one ? ' ' + ones[one] : '');
  }
  
  const hundred = Math.floor(num / 100);
  const remainder = num % 100;
  return ones[hundred] + ' Hundred' + (remainder ? ' ' + convertLessThanThousand(remainder) : '');
}

export function numberToWordsINR(amount: number): string {
  if (amount === 0) return 'Zero Rupees Only';
  
  const rupees = Math.floor(amount);
  const paise = Math.round((amount - rupees) * 100);
  
  if (rupees === 0 && paise === 0) return 'Zero Rupees Only';
  
  let words = '';
  
  if (rupees > 0) {
    // Indian numbering system: Crore, Lakh, Thousand, Hundred
    const crore = Math.floor(rupees / 10000000);
    const lakh = Math.floor((rupees % 10000000) / 100000);
    const thousand = Math.floor((rupees % 100000) / 1000);
    const remainder = rupees % 1000;
    
    if (crore > 0) {
      words += convertLessThanThousand(crore) + ' Crore ';
    }
    if (lakh > 0) {
      words += convertLessThanThousand(lakh) + ' Lakh ';
    }
    if (thousand > 0) {
      words += convertLessThanThousand(thousand) + ' Thousand ';
    }
    if (remainder > 0) {
      words += convertLessThanThousand(remainder);
    }
    
    words = words.trim() + ' Rupees';
  }
  
  if (paise > 0) {
    if (rupees > 0) {
      words += ' and ';
    }
    words += convertLessThanThousand(paise) + ' Paise';
  }
  
  return words.trim() + ' Only';
}

export function numberToWordsUSD(amount: number): string {
  if (amount === 0) return 'Zero Dollars Only';
  
  const dollars = Math.floor(amount);
  const cents = Math.round((amount - dollars) * 100);
  
  if (dollars === 0 && cents === 0) return 'Zero Dollars Only';
  
  let words = '';
  
  if (dollars > 0) {
    const billion = Math.floor(dollars / 1000000000);
    const million = Math.floor((dollars % 1000000000) / 1000000);
    const thousand = Math.floor((dollars % 1000000) / 1000);
    const remainder = dollars % 1000;
    
    if (billion > 0) {
      words += convertLessThanThousand(billion) + ' Billion ';
    }
    if (million > 0) {
      words += convertLessThanThousand(million) + ' Million ';
    }
    if (thousand > 0) {
      words += convertLessThanThousand(thousand) + ' Thousand ';
    }
    if (remainder > 0) {
      words += convertLessThanThousand(remainder);
    }
    
    words = words.trim() + ' Dollars';
  }
  
  if (cents > 0) {
    if (dollars > 0) {
      words += ' and ';
    }
    words += convertLessThanThousand(cents) + ' Cents';
  }
  
  return words.trim() + ' Only';
}
