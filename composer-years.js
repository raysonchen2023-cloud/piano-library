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
 'Robert Lopez':[1975,null],
 'Wilhelm Lutter':[1914,1999],      // printed on the score
 'Edward Weiss':[1962,null],
 'Seiichiro Kuribayashi':[1965,null],
 '栗林誠一郎':[1965,null],
 '李凯稠':[1981,null],
 '钱雷':[1982,null]
};
// Chinese / Japanese names shown in Traditional Chinese for this reader.
window.COMPOSER_DISPLAY={'\u0421\u0435\u0440\u0433\u0435\u0439 \u0420\u0430\u0445\u043c\u0430\u043d\u0438\u043d\u043e\u0432':'\u0421\u0435\u0440\u0433\u0435\u0439 \u0420\u0430\u0445\u043c\u0430\u043d\u0438\u043d\u043e\u0432 · Sergei Rachmaninoff','久石譲':'久石讓','黎锦晖':'黎錦暉','钱雷':'錢雷','李凯稠':'李凱稠'};
// "(1810–1849)"; living composers "(1950– )".
window.composerWithYears=name=>String(name??'').split(' / ').map(part=>{
 const key=part.trim(),shown=window.COMPOSER_DISPLAY[key]||key,y=window.COMPOSER_YEARS[key];
 return y?`${shown} (${y[0]}–${y[1]??' '})`:shown;
}).join(' / ');
// Birth year for sorting; composers without known years sort last.
window.composerBirth=name=>Math.min(...String(name??'').split(' / ').map(p=>window.COMPOSER_YEARS[p.trim()]?.[0]??Infinity));
window.byComposerBirth=(a,b)=>window.composerBirth(a)-window.composerBirth(b)||String(a).localeCompare(String(b),'en');
// Same people written in a different order in the catalog.
window.COMPOSER_ALIAS={'Robert Lopez / Kristen Anderson-Lopez':'Kristen Anderson-Lopez / Robert Lopez'};
window.normalizeComposers=rows=>{for(const r of rows||[])if(window.COMPOSER_ALIAS[r.composer])r.composer=window.COMPOSER_ALIAS[r.composer];return rows};

window.COMPOSER_ALIASES={'\u0421\u0435\u0440\u0433\u0435\u0439 \u0420\u0430\u0445\u043c\u0430\u043d\u0438\u043d\u043e\u0432':['Sergei Rachmaninoff','Sergey Rachmaninov','Rachmaninoff','Rachmaninov','\u62c9\u8d6b\u66fc\u5c3c\u8afe\u592b']};
window.composerSearchText=name=>[name,window.composerWithYears(name),...(window.COMPOSER_ALIASES[name]||[])].join(' ');
