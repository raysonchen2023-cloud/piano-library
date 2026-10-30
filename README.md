# 鋼琴曲譜資料庫

雙擊 `Open-Library.cmd`，再開啟 http://127.0.0.1:18849/index.html 。啟動器使用已安裝的 Python，只監聽本機。請保留整個資料夾。直接開啟 index.html 可瀏覽索引；閱讀、播放、小節對位請使用本機網址。

## 功能

- 作曲家、主題、曲種、來源篩選，作品編號及中英文搜尋。
- 預設作品編號數字排序，再依 No. 排序。
- PDF 閱讀、翻頁、縮放、備用來源與下載。
- 收藏與收藏 JSON 匯出／匯入，保留既有蕭邦收藏 ID。
- 真實鋼琴錄音取樣播放、暫停、停止、進度、速度與音量。預設100%沿用來源速度及途中變速。
- 小節高亮與對位匯出／匯入，跟隨已對位小節翻頁。

## 播放與小節的範圍

目前有400份 Mutopia 演奏資料。使用 Alexander Holm 的 Salamander Grand Piano 三角鋼琴錄音取樣，依來源音符資料重建演奏；不是鋼琴家預錄的整首演奏。MIDI只用作內部音符及時間資料，沒有使用電腦內建GM音色。目前所有聲部都以鋼琴音色播放。

僅提供可核對的同曲譜或同作品參考版。掃描合集需選曲，沒有相符資料時不會隨意配其他曲目。來源沒有明確BPM時，不能把參考速度當成唯一原速。

自動小節對位只提供5份已核對的蕭邦前奏曲：Op.28 No.1、2、3、8、9指定Mutopia PDF。其他版本、歷史掃描合集需手動對位；弱起、反覆、華彩與版本差異會影響編號，尚未提供全庫掃描譜自動辨譜。

手動對位：選曲，展開「速度、音量與小節對位」，按「標記小節位置」，設定小節編號及起始秒數，依序點選該小節左上角和右下角。對位資料儲存在目前瀏覽器，可以匯出備份。

## 檔案與授權

- catalog.json／catalog.js：主目錄、來源、版本、授權、下載狀態、大小、頁數、SHA-256。
- validation-report.json：PDF解析、雜湊與完整性檢查，不等於每頁逐音符人工校對。
- sources/：原始來源、署名和版本授權資料。
- performances/、audio/piano/：演奏資料和鋼琴錄音取樣；各自保留授權。
- auto-alignment-report.json：自動小節對位範圍。
- 各 coverage.json：有限來源的收錄範圍、缺項與限制。

電影、Kevin Kern、I Giorni、Yann Tiersen及Cuppix等受限制的完整曲譜未擅自下載，以官方／原站取得連結收錄。Cuppix公開分頁回傳不同年代快照，目前438筆連結不代表原站標示的全部897首改編。Six pièces Vol.2舊頁失效，另附出版社替代曲集，並標示與原六首冊的差別。

這不是網路全部曲譜、全部作品、全部版本或全部兒歌。曲集／分卷與不同PDF版本不能當成獨立單曲總數。資料保存在電腦，沒有匯入ChatGPT永久資料庫。

## 更新與備份

使用各來源下載腳本產生 *-additions.json，執行 `python merge_catalog.py` 合併、驗證和內容去重。早期build_library.py只是最初蕭邦來源蒐集器，不要用它重建整個擴充庫。

播放更新流程：`python download_playback.py` → `node build_performances.cjs` → `python build_auto_alignments.py`。維護腳本需要Python、beautifulsoup4、pypdf及Node.js；平常開啟只需已安裝的Python。

早期deliver/chopin-library.zip僅含初版蕭邦內容，不是現在擴充版備份。請複製整個chopin-library資料夾，並另行匯出瀏覽器收藏與小節對位。

更新日期：2026-10-30。
# 2026-10-30：小節標線與直接讀譜演奏

- 已對位譜面的小節起點以藍色虛線與編號顯示；目前播放的小節以橘色實線與淡黃色底顯示。掃描譜未對位時不會猜測位置。
- `build_xml_performances.py` 使用 music21 直接讀取館藏的 9 份 MusicXML，展開反覆並合併延音，產生鋼琴音符事件，無須 MIDI。播放仍使用 Salamander 真實鋼琴錄音取樣。
- 若重建原 MIDI 演奏索引，之後再執行 `python build_xml_performances.py`，保留這 9 份直接讀譜演奏；詳細結果見 `xml-performance-report.json`。
- 此功能尚不能自動辨識所有掃描 PDF 的音符；圖像辨譜需另行處理及校對。

