// Composer life years, shown next to names: "Fryderyk Chopin (1810–1849)".
// [born, died]; died null = living. Names not listed (or unsure) show without years.
window.COMPOSER_YEARS={
 'Johann Pachelbel':[1653,1706],
 'Johann Sebastian Bach':[1685,1750],
 'Wolfgang Amadeus Mozart':[1756,1791],
 'Ludwig van Beethoven':[1770,1827],
 'Carl Czerny':[1791,1857],
 'Franz Schubert':[1797,1828],
 'Fryderyk Chopin':[1810,1849],
 'Robert Schumann':[1810,1856],
 'Liszt Ferenc':[1811,1886],
 'Charles-Louis Hanon':[1819,1900],
 'Johannes Brahms':[1833,1897],
 'James William Elliott':[1833,1915],
 'Elizabeth Sprague Coolidge':[1864,1953],
 'Sidney Homer':[1864,1953],
 'Erik Satie':[1866,1925],
 'Сергей Рахманинов':[1873,1943],
 '黎锦晖':[1891,1967],
 'Ennio Morricone':[1928,2020],
 'John Williams':[1932,null],
 'Vangelis':[1943,2022],
 'Alan Silvestri':[1950,null],
 '久石譲':[1950,null],
 'James Horner':[1953,2015],
 'Hans Zimmer':[1957,null],
 'Alexandre Desplat':[1961,null],
 'Klaus Badelt':[1967,null],
 'Yann Tiersen':[1970,null],
 'Kristen Anderson-Lopez':[1972,null],
 'Robert Lopez':[1975,null]
};
// Chinese / Japanese names shown in Traditional Chinese for this reader.
window.COMPOSER_DISPLAY={'久石譲':'久石讓','黎锦晖':'黎錦暉','钱雷':'錢雷','李凯稠':'李凱稠'};
// "(1810–1849)"; living composers "(1950– )".
window.composerWithYears=name=>String(name??'').split(' / ').map(part=>{
 const key=part.trim(),shown=window.COMPOSER_DISPLAY[key]||key,y=window.COMPOSER_YEARS[key];
 return y?`${shown} (${y[0]}–${y[1]??' '})`:shown;
}).join(' / ');
