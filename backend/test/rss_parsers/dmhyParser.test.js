const { DmhyParser } = require('../../src/rss_parsers/dmhyParser');

// Sample RSS XML from the issue - showing the problematic format with newlines between tags and CDATA
const sampleXml = `<?xml version="1.0" encoding="utf-8"?>
<rss version="2.0" 
xmlns:content="http://purl.org/rss/1.0/modules/content/" 
xmlns:wfw="http://wellformedweb.org/CommentAPI/" 
>
<channel>
<title><![CDATA[喵萌奶茶屋-動漫花園資源網]]></title>
<link>http://share.dmhy.org</link>
<description><![CDATA[動漫花園資訊網是一個動漫愛好者交流的平台,提供最及時,最全面的動畫,漫畫,動漫音樂,動漫下載,BT,ED,動漫遊戲,資訊,分享,交流,讨论.]]></description>
<language>zh-cn</language>
<pubDate>Mon, 09 Feb 2026 03:10:09 +0800</pubDate>
<item>
<title><![CDATA[【喵萌奶茶屋】★01月新番★[葬送的芙莉蓮 / Sousou no Frieren][31][1080p][繁日雙語][招募翻譯]]]></title>
<link>http://share.dmhy.org/topics/view/712650_01_Sousou_no_Frieren_31_1080p.html</link>
<pubDate>Thu, 05 Feb 2026 01:15:07 +0800</pubDate>
<description><![CDATA[<p><img src="https://s2.loli.net/2023/10/04/2YE8DWOANHUxJKf.png" width="1000px" /></p>
<hr />
<p><img src="https://nekomoe.pages.dev/images/mainVisual/char.jpg" /></p>
<hr />
<p>喵萌奶茶屋招募以下職位的小伙伴！</p>
<p>1.<strong>翻譯</strong>：沒有證書要求，能正確聽譯一集動畫即可</p>
<p>2.<strong>時軸</strong>：使用 Aegisub 準確拉軸對幀並設置合適的樣式、字體、螢幕字</p>
<p>申請請加入 QQ 群 421320480 參加考核，請正確註明應募的職位。</p>
<hr />
<p>奶茶屋所有最新的【<a href="https://github.com/Nekomoekissaten-SUB/Nekomoekissaten-Subs" target="_blank" rel="external nofollow"><strong>外掛字幕</strong></a>】在這裡，若想轉載修改見 repo 的 README。</p>
<hr />
<p>若有問題回報，可以通過 Nekomoekissaten-Subs GitHub repo 的 <a href="https://github.com/Nekomoekissaten-SUB/Nekomoekissaten-Subs/issues" target="_blank" rel="external nofollow"><strong>Issues</strong></a> 或 <a href="https://docs.google.com/forms/d/e/1FAIpQLSfHsIh37P2PI1oQDCEOHyUw2JBqB5db_1ZqY0O06xYqWIFbRA/viewform" target="_blank" rel="external nofollow"><strong>Google 表單</strong></a> 進行回報。
</p>]]></description>
<enclosure url="magnet:?xt=urn:btih:JUK57T36TXYRDIZZYDFS4N3MKEQWL3R3&amp;dn=&amp;tr=http%3A%2F%2F104.143.10.186%3A8000%2Fannounce&amp;tr=udp%3A%2F%2F104.143.10.186%3A8000%2Fannounce&amp;tr=http%3A%2F%2Ftracker.openbittorrent.com%3A80%2Fannounce&amp;tr=http%3A%2F%2Ftracker3.itzmx.com%3A6961%2Fannounce&amp;tr=http%3A%2F%2Ftracker4.itzmx.com%3A2710%2Fannounce&amp;tr=http%3A%2F%2Ftracker.publicbt.com%3A80%2Fannounce&amp;tr=http%3A%2F%2Ftracker.prq.to%2Fannounce&amp;tr=http%3A%2F%2Fopen.acgtracker.com%3A1096%2Fannounce&amp;tr=https%3A%2F%2Ft-115.rhcloud.com%2Fonly_for_ylbud&amp;tr=http%3A%2F%2Ftracker1.itzmx.com%3A8080%2Fannounce&amp;tr=http%3A%2F%2Ftracker2.itzmx.com%3A6961%2Fannounce&amp;tr=udp%3A%2F%2Ftracker1.itzmx.com%3A8080%2Fannounce&amp;tr=udp%3A%2F%2Ftracker2.itzmx.com%3A6961%2Fannounce&amp;tr=udp%3A%2F%2Ftracker3.itzmx.com%3A6961%2Fannounce&amp;tr=udp%3A%2F%2Ftracker4.itzmx.com%3A2710%2Fannounce&amp;tr=http%3A%2F%2Fnyaa.tracker.wf%3A7777%2Fannounce&amp;tr=http%3A%2F%2Ft.acg.rip%3A6699%2Fannounce&amp;tr=http%3A%2F%2Fshare.camoe.cn%3A8080%2Fannounce&amp;tr=http%3A%2F%2Fsukebei.tracker.wf%3A8888%2Fannounce&amp;tr=https%3A%2F%2Fopentracker.i2p.rocks%3A443%2Fannounce&amp;tr=http%3A%2F%2Fshare.hkg-fansub.info%3A80%2Fannounce.php&amp;tr=http%3A%2F%2Ftracker.ipv6tracker.org%2Fannounce"  length="1"  type="application/x-bittorrent" ></enclosure>
<author><![CDATA[nekomoekissaten]]></author>
<guid isPermaLink="true" >http://share.dmhy.org/topics/view/712650_01_Sousou_no_Frieren_31_1080p.html</guid>
<category domain="http://share.dmhy.org/topics/list/sort_id/2" ><![CDATA[動畫]]></category>
</item>
<item>
<title><![CDATA[【喵萌奶茶屋】★01月新番★[葬送的芙莉莲 / Sousou no Frieren][31][1080p][简日双语][招募翻译]]]></title>
<link>http://share.dmhy.org/topics/view/712649_01_Sousou_no_Frieren_31_1080p.html</link>
<pubDate>Thu, 05 Feb 2026 01:14:57 +0800</pubDate>
<description><![CDATA[<p><img src="https://s2.loli.net/2023/10/04/2YE8DWOANHUxJKf.png" width="1000px" /></p>
<hr />
<p><img src="https://nekomoe.pages.dev/images/mainVisual/char.jpg" /></p>
<hr />
<p>喵萌奶茶屋招募以下职位的小伙伴！</p>
<p>1.<strong>翻译</strong>：没有证书要求，能正确听译一集动画即可</p>
<p>2.<strong>时轴</strong>：使用 Aegisub 准确拉轴对帧并设置合适的样式、字体、屏幕字</p>
<p>申请请加入 QQ 群 421320480 参加考核，请正确注明应募的职位。</p>
<hr />
<p>奶茶屋所有最新的【<a href="https://github.com/Nekomoekissaten-SUB/Nekomoekissaten-Subs" target="_blank" rel="external nofollow"><strong>外挂字幕</strong></a>】在这里，若想转载修改见 repo 的 README。</p>
<hr />
<p>若有问题回报，可以通过 Nekomoekissaten-Subs GitHub repo 的 <a href="https://github.com/Nekomoekissaten-SUB/Nekomoekissaten-Subs/issues" target="_blank" rel="external nofollow"><strong>Issues</strong></a> 或 <a href="https://docs.google.com/forms/d/e/1FAIpQLSfHsIh37P2PI1oQDCEOHyUw2JBqB5db_1ZqY0O06xYqWIFbRA/viewform" target="_blank" rel="external nofollow"><strong>Google 表单</strong></a> 进行回报。
</p>]]></description>
<enclosure url="magnet:?xt=urn:btih:5SXU5LGFKGUJ4HTVWAOBUWGQDLK5PPCG&amp;dn=&amp;tr=http%3A%2F%2F104.143.10.186%3A8000%2Fannounce&amp;tr=udp%3A%2F%2F104.143.10.186%3A8000%2Fannounce&amp;tr=http%3A%2F%2Ftracker.openbittorrent.com%3A80%2Fannounce&amp;tr=http%3A%2F%2Ftracker3.itzmx.com%3A6961%2Fannounce&amp;tr=http%3A%2F%2Ftracker4.itzmx.com%3A2710%2Fannounce&amp;tr=http%3A%2F%2Ftracker.publicbt.com%3A80%2Fannounce&amp;tr=http%3A%2F%2Ftracker.prq.to%2Fannounce&amp;tr=http%3A%2F%2Fopen.acgtracker.com%3A1096%2Fannounce&amp;tr=https%3A%2F%2Ft-115.rhcloud.com%2Fonly_for_ylbud&amp;tr=http%3A%2F%2Ftracker1.itzmx.com%3A8080%2Fannounce&amp;tr=http%3A%2F%2Ftracker2.itzmx.com%3A6961%2Fannounce&amp;tr=udp%3A%2F%2Ftracker1.itzmx.com%3A8080%2Fannounce&amp;tr=udp%3A%2F%2Ftracker2.itzmx.com%3A6961%2Fannounce&amp;tr=udp%3A%2F%2Ftracker3.itzmx.com%3A6961%2Fannounce&amp;tr=udp%3A%2F%2Ftracker4.itzmx.com%3A2710%2Fannounce&amp;tr=http%3A%2F%2Fnyaa.tracker.wf%3A7777%2Fannounce&amp;tr=http%3A%2F%2Ft.acg.rip%3A6699%2Fannounce&amp;tr=http%3A%2F%2Fshare.camoe.cn%3A8080%2Fannounce&amp;tr=http%3A%2F%2Fsukebei.tracker.wf%3A8888%2Fannounce&amp;tr=https%3A%2F%2Fopentracker.i2p.rocks%3A443%2Fannounce&amp;tr=http%3A%2F%2Fshare.hkg-fansub.info%3A80%2Fannounce.php&amp;tr=http%3A%2F%2Ftracker.ipv6tracker.org%2Fannounce"  length="1"  type="application/x-bittorrent" ></enclosure>
<author><![CDATA[nekomoekissaten]]></author>
<guid isPermaLink="true" >http://share.dmhy.org/topics/view/712649_01_Sousou_no_Frieren_31_1080p.html</guid>
<category domain="http://share.dmhy.org/topics/list/sort_id/2" ><![CDATA[動畫]]></category>
</item>
<item>
<title><![CDATA[【喵萌奶茶屋】★01月新番★[葬送的芙莉蓮 / Sousou no Frieren][30][1080p][繁日雙語][招募翻譯]]]></title>
<link>http://share.dmhy.org/topics/view/711972_01_Sousou_no_Frieren_30_1080p.html</link>
<pubDate>Mon, 26 Jan 2026 01:52:03 +0800</pubDate>
<description><![CDATA[<p><img src="https://s2.loli.net/2023/10/04/2YE8DWOANHUxJKf.png" width="1000px" /></p>
<hr />
<p><img src="https://nekomoe.pages.dev/images/mainVisual/char.jpg" /></p>
<hr />
<p>喵萌奶茶屋招募以下職位的小伙伴！</p>
<p>1.<strong>翻譯</strong>：沒有證書要求，能正確聽譯一集動畫即可</p>
<p>2.<strong>時軸</strong>：使用 Aegisub 準確拉軸對幀並設置合適的樣式、字體、螢幕字</p>
<p>申請請加入 QQ 群 421320480 參加考核，請正確註明應募的職位。</p>
<hr />
<p>奶茶屋所有最新的【<a href="https://github.com/Nekomoekissaten-SUB/Nekomoekissaten-Subs" target="_blank" rel="external nofollow"><strong>外掛字幕</strong></a>】在這裡，若想轉載修改見 repo 的 README。</p>
<hr />
<p>若有問題回報，可以通過 Nekomoekissaten-Subs GitHub repo 的 <a href="https://github.com/Nekomoekissaten-SUB/Nekomoekissaten-Subs/issues" target="_blank" rel="external nofollow"><strong>Issues</strong></a> 或 <a href="https://docs.google.com/forms/d/e/1FAIpQLSfHsIh37P2PI1oQDCEOHyUw2JBqB5db_1ZqY0O06xYqWIFbRA/viewform" target="_blank" rel="external nofollow"><strong>Google 表單</strong></a> 進行回報。
</p>]]></description>
<enclosure url="magnet:?xt=urn:btih:YG7DUTYC64CC4IQ4ZVPSVIKYV54C4LD3&amp;dn=&amp;tr=http%3A%2F%2F104.143.10.186%3A8000%2Fannounce&amp;tr=udp%3A%2F%2F104.143.10.186%3A8000%2Fannounce&amp;tr=http%3A%2F%2Ftracker.openbittorrent.com%3A80%2Fannounce&amp;tr=http%3A%2F%2Ftracker3.itzmx.com%3A6961%2Fannounce&amp;tr=http%3A%2F%2Ftracker4.itzmx.com%3A2710%2Fannounce&amp;tr=http%3A%2F%2Ftracker.publicbt.com%3A80%2Fannounce&amp;tr=http%3A%2F%2Ftracker.prq.to%2Fannounce&amp;tr=http%3A%2F%2Fopen.acgtracker.com%3A1096%2Fannounce&amp;tr=https%3A%2F%2Ft-115.rhcloud.com%2Fonly_for_ylbud&amp;tr=http%3A%2F%2Ftracker1.itzmx.com%3A8080%2Fannounce&amp;tr=http%3A%2F%2Ftracker2.itzmx.com%3A6961%2Fannounce&amp;tr=udp%3A%2F%2Ftracker1.itzmx.com%3A8080%2Fannounce&amp;tr=udp%3A%2F%2Ftracker2.itzmx.com%3A6961%2Fannounce&amp;tr=udp%3A%2F%2Ftracker3.itzmx.com%3A6961%2Fannounce&amp;tr=udp%3A%2F%2Ftracker4.itzmx.com%3A2710%2Fannounce&amp;tr=http%3A%2F%2Fnyaa.tracker.wf%3A7777%2Fannounce&amp;tr=http%3A%2F%2Ft.acg.rip%3A6699%2Fannounce&amp;tr=http%3A%2F%2Fshare.camoe.cn%3A8080%2Fannounce&amp;tr=http%3A%2F%2Fsukebei.tracker.wf%3A8888%2Fannounce&amp;tr=https%3A%2F%2Fopentracker.i2p.rocks%3A443%2Fannounce&amp;tr=http%3A%2F%2Fshare.hkg-fansub.info%3A80%2Fannounce.php&amp;tr=http%3A%2F%2Ftracker.ipv6tracker.org%2Fannounce"  length="1"  type="application/x-bittorrent" ></enclosure>
<author><![CDATA[nekomoekissaten]]></author>
<guid isPermaLink="true" >http://share.dmhy.org/topics/view/711972_01_Sousou_no_Frieren_30_1080p.html</guid>
<category domain="http://share.dmhy.org/topics/list/sort_id/2" ><![CDATA[動畫]]></category>
</item>
<item>
<title><![CDATA[【喵萌奶茶屋】★01月新番★[葬送的芙莉莲 / Sousou no Frieren][30][1080p][简日双语][招募翻译]]]></title>
<link>http://share.dmhy.org/topics/view/711971_01_Sousou_no_Frieren_30_1080p.html</link>
<pubDate>Mon, 26 Jan 2026 01:51:54 +0800</pubDate>
<description><![CDATA[<p><img src="https://s2.loli.net/2023/10/04/2YE8DWOANHUxJKf.png" width="1000px" /></p>
<hr />
<p><img src="https://nekomoe.pages.dev/images/mainVisual/char.jpg" /></p>
<hr />
<p>喵萌奶茶屋招募以下职位的小伙伴！</p>
<p>1.<strong>翻译</strong>：没有证书要求，能正确听译一集动画即可</p>
<p>2.<strong>时轴</strong>：使用 Aegisub 准确拉轴对帧并设置合适的样式、字体、屏幕字</p>
<p>申请请加入 QQ 群 421320480 参加考核，请正确注明应募的职位。</p>
<hr />
<p>奶茶屋所有最新的【<a href="https://github.com/Nekomoekissaten-SUB/Nekomoekissaten-Subs" target="_blank" rel="external nofollow"><strong>外挂字幕</strong></a>】在这里，若想转载修改见 repo 的 README。</p>
<hr />
<p>若有问题回报，可以通过 Nekomoekissaten-Subs GitHub repo 的 <a href="https://github.com/Nekomoekissaten-SUB/Nekomoekissaten-Subs/issues" target="_blank" rel="external nofollow"><strong>Issues</strong></a> 或 <a href="https://docs.google.com/forms/d/e/1FAIpQLSfHsIh37P2PI1oQDCEOHyUw2JBqB5db_1ZqY0O06xYqWIFbRA/viewform" target="_blank" rel="external nofollow"><strong>Google 表单</strong></a> 进行回报。
</p>]]></description>
<enclosure url="magnet:?xt=urn:btih:KRASAIO7QTO3VUO3OFNMTEFCW7T4TSHN&amp;dn=&amp;tr=http%3A%2F%2F104.143.10.186%3A8000%2Fannounce&amp;tr=udp%3A%2F%2F104.143.10.186%3A8000%2Fannounce&amp;tr=http%3A%2F%2Ftracker.openbittorrent.com%3A80%2Fannounce&amp;tr=http%3A%2F%2Ftracker3.itzmx.com%3A6961%2Fannounce&amp;tr=http%3A%2F%2Ftracker4.itzmx.com%3A2710%2Fannounce&amp;tr=http%3A%2F%2Ftracker.publicbt.com%3A80%2Fannounce&amp;tr=http%3A%2F%2Ftracker.prq.to%2Fannounce&amp;tr=http%3A%2F%2Fopen.acgtracker.com%3A1096%2Fannounce&amp;tr=https%3A%2F%2Ft-115.rhcloud.com%2Fonly_for_ylbud&amp;tr=http%3A%2F%2Ftracker1.itzmx.com%3A8080%2Fannounce&amp;tr=http%3A%2F%2Ftracker2.itzmx.com%3A6961%2Fannounce&amp;tr=udp%3A%2F%2Ftracker1.itzmx.com%3A8080%2Fannounce&amp;tr=udp%3A%2F%2Ftracker2.itzmx.com%3A6961%2Fannounce&amp;tr=udp%3A%2F%2Ftracker3.itzmx.com%3A6961%2Fannounce&amp;tr=udp%3A%2F%2Ftracker4.itzmx.com%3A2710%2Fannounce&amp;tr=http%3A%2F%2Fnyaa.tracker.wf%3A7777%2Fannounce&amp;tr=http%3A%2F%2Ft.acg.rip%3A6699%2Fannounce&amp;tr=http%3A%2F%2Fshare.camoe.cn%3A8080%2Fannounce&amp;tr=http%3A%2F%2Fsukebei.tracker.wf%3A8888%2Fannounce&amp;tr=https%3A%2F%2Fopentracker.i2p.rocks%3A443%2Fannounce&amp;tr=http%3A%2F%2Fshare.hkg-fansub.info%3A80%2Fannounce.php&amp;tr=http%3A%2F%2Ftracker.ipv6tracker.org%2Fannounce"  length="1"  type="application/x-bittorrent" ></enclosure>
<author><![CDATA[nekomoekissaten]]></author>
<guid isPermaLink="true" >http://share.dmhy.org/topics/view/711971_01_Sousou_no_Frieren_30_1080p.html</guid>
<category domain="http://share.dmhy.org/topics/list/sort_id/2" ><![CDATA[動畫]]></category>
</item>
<item>
<title><![CDATA[【喵萌奶茶屋】★01月新番★[葬送的芙莉蓮 / Sousou no Frieren][29][1080p][繁日雙語][招募翻譯]]]></title>
<link>http://share.dmhy.org/topics/view/711970_01_Sousou_no_Frieren_29_1080p.html</link>
<pubDate>Mon, 26 Jan 2026 01:51:36 +0800</pubDate>
<description><![CDATA[<p><img src="https://s2.loli.net/2023/10/04/2YE8DWOANHUxJKf.png" width="1000px" /></p>
<hr />
<p><img src="https://nekomoe.pages.dev/images/mainVisual/char.jpg" /></p>
<hr />
<p>喵萌奶茶屋招募以下職位的小伙伴！</p>
<p>1.<strong>翻譯</strong>：沒有證書要求，能正確聽譯一集動畫即可</p>
<p>2.<strong>時軸</strong>：使用 Aegisub 準確拉軸對幀並設置合適的樣式、字體、螢幕字</p>
<p>申請請加入 QQ 群 421320480 參加考核，請正確註明應募的職位。</p>
<hr />
<p>奶茶屋所有最新的【<a href="https://github.com/Nekomoekissaten-SUB/Nekomoekissaten-Subs" target="_blank" rel="external nofollow"><strong>外掛字幕</strong></a>】在這裡，若想轉載修改見 repo 的 README。</p>
<hr />
<p>若有問題回報，可以通過 Nekomoekissaten-Subs GitHub repo 的 <a href="https://github.com/Nekomoekissaten-SUB/Nekomoekissaten-Subs/issues" target="_blank" rel="external nofollow"><strong>Issues</strong></a> 或 <a href="https://docs.google.com/forms/d/e/1FAIpQLSfHsIh37P2PI1oQDCEOHyUw2JBqB5db_1ZqY0O06xYqWIFbRA/viewform" target="_blank" rel="external nofollow"><strong>Google 表單</strong></a> 進行回報。
</p>]]></description>
<enclosure url="magnet:?xt=urn:btih:ML6R3J6AC6GEWPQYJ7CH2KKSCTVCIJNR&amp;dn=&amp;tr=http%3A%2F%2F104.143.10.186%3A8000%2Fannounce&amp;tr=udp%3A%2F%2F104.143.10.186%3A8000%2Fannounce&amp;tr=http%3A%2F%2Ftracker.openbittorrent.com%3A80%2Fannounce&amp;tr=http%3A%2F%2Ftracker3.itzmx.com%3A6961%2Fannounce&amp;tr=http%3A%2F%2Ftracker4.itzmx.com%3A2710%2Fannounce&amp;tr=http%3A%2F%2Ftracker.publicbt.com%3A80%2Fannounce&amp;tr=http%3A%2F%2Ftracker.prq.to%2Fannounce&amp;tr=http%3A%2F%2Fopen.acgtracker.com%3A1096%2Fannounce&amp;tr=https%3A%2F%2Ft-115.rhcloud.com%2Fonly_for_ylbud&amp;tr=http%3A%2F%2Ftracker1.itzmx.com%3A8080%2Fannounce&amp;tr=http%3A%2F%2Ftracker2.itzmx.com%3A6961%2Fannounce&amp;tr=udp%3A%2F%2Ftracker1.itzmx.com%3A8080%2Fannounce&amp;tr=udp%3A%2F%2Ftracker2.itzmx.com%3A6961%2Fannounce&amp;tr=udp%3A%2F%2Ftracker3.itzmx.com%3A6961%2Fannounce&amp;tr=udp%3A%2F%2Ftracker4.itzmx.com%3A2710%2Fannounce&amp;tr=http%3A%2F%2Fnyaa.tracker.wf%3A7777%2Fannounce&amp;tr=http%3A%2F%2Ft.acg.rip%3A6699%2Fannounce&amp;tr=http%3A%2F%2Fshare.camoe.cn%3A8080%2Fannounce&amp;tr=http%3A%2F%2Fsukebei.tracker.wf%3A8888%2Fannounce&amp;tr=https%3A%2F%2Fopentracker.i2p.rocks%3A443%2Fannounce&amp;tr=http%3A%2F%2Fshare.hkg-fansub.info%3A80%2Fannounce.php&amp;tr=http%3A%2F%2Ftracker.ipv6tracker.org%2Fannounce"  length="1"  type="application/x-bittorrent" ></enclosure>
<author><![CDATA[nekomoekissaten]]></author>
<guid isPermaLink="true" >http://share.dmhy.org/topics/view/711970_01_Sousou_no_Frieren_29_1080p.html</guid>
<category domain="http://share.dmhy.org/topics/list/sort_id/2" ><![CDATA[動畫]]></category>
</item>
<item>
<title><![CDATA[【喵萌奶茶屋】★01月新番★[葬送的芙莉莲 / Sousou no Frieren][29][1080p][简日双语][招募翻译]]]></title>
<link>http://share.dmhy.org/topics/view/711969_01_Sousou_no_Frieren_29_1080p.html</link>
<pubDate>Mon, 26 Jan 2026 01:51:25 +0800</pubDate>
<description><![CDATA[<p><img src="https://s2.loli.net/2023/10/04/2YE8DWOANHUxJKf.png" width="1000px" /></p>
<hr />
<p><img src="https://nekomoe.pages.dev/images/mainVisual/char.jpg" /></p>
<hr />
<p>喵萌奶茶屋招募以下职位的小伙伴！</p>
<p>1.<strong>翻译</strong>：没有证书要求，能正确听译一集动画即可</p>
<p>2.<strong>时轴</strong>：使用 Aegisub 准确拉轴对帧并设置合适的样式、字体、屏幕字</p>
<p>申请请加入 QQ 群 421320480 参加考核，请正确注明应募的职位。</p>
<hr />
<p>奶茶屋所有最新的【<a href="https://github.com/Nekomoekissaten-SUB/Nekomoekissaten-Subs" target="_blank" rel="external nofollow"><strong>外挂字幕</strong></a>】在这里，若想转载修改见 repo 的 README。</p>
<hr />
<p>若有问题回报，可以通过 Nekomoekissaten-Subs GitHub repo 的 <a href="https://github.com/Nekomoekissaten-SUB/Nekomoekissaten-Subs/issues" target="_blank" rel="external nofollow"><strong>Issues</strong></a> 或 <a href="https://docs.google.com/forms/d/e/1FAIpQLSfHsIh37P2PI1oQDCEOHyUw2JBqB5db_1ZqY0O06xYqWIFbRA/viewform" target="_blank" rel="external nofollow"><strong>Google 表单</strong></a> 进行回报。
</p>]]></description>
<enclosure url="magnet:?xt=urn:btih:RJCXZIPIGGDKCOU35O53SUQ2UZV2WSNG&amp;dn=&amp;tr=http%3A%2F%2F104.143.10.186%3A8000%2Fannounce&amp;tr=udp%3A%2F%2F104.143.10.186%3A8000%2Fannounce&amp;tr=http%3A%2F%2Ftracker.openbittorrent.com%3A80%2Fannounce&amp;tr=http%3A%2F%2Ftracker3.itzmx.com%3A6961%2Fannounce&amp;tr=http%3A%2F%2Ftracker4.itzmx.com%3A2710%2Fannounce&amp;tr=http%3A%2F%2Ftracker.publicbt.com%3A80%2Fannounce&amp;tr=http%3A%2F%2Ftracker.prq.to%2Fannounce&amp;tr=http%3A%2F%2Fopen.acgtracker.com%3A1096%2Fannounce&amp;tr=https%3A%2F%2Ft-115.rhcloud.com%2Fonly_for_ylbud&amp;tr=http%3A%2F%2Ftracker1.itzmx.com%3A8080%2Fannounce&amp;tr=http%3A%2F%2Ftracker2.itzmx.com%3A6961%2Fannounce&amp;tr=udp%3A%2F%2Ftracker1.itzmx.com%3A8080%2Fannounce&amp;tr=udp%3A%2F%2Ftracker2.itzmx.com%3A6961%2Fannounce&amp;tr=udp%3A%2F%2Ftracker3.itzmx.com%3A6961%2Fannounce&amp;tr=udp%3A%2F%2Ftracker4.itzmx.com%3A2710%2Fannounce&amp;tr=http%3A%2F%2Fnyaa.tracker.wf%3A7777%2Fannounce&amp;tr=http%3A%2F%2Ft.acg.rip%3A6699%2Fannounce&amp;tr=http%3A%2F%2Fshare.camoe.cn%3A8080%2Fannounce&amp;tr=http%3A%2F%2Fsukebei.tracker.wf%3A8888%2Fannounce&amp;tr=https%3A%2F%2Fopentracker.i2p.rocks%3A443%2Fannounce&amp;tr=http%3A%2F%2Fshare.hkg-fansub.info%3A80%2Fannounce.php&amp;tr=http%3A%2F%2Ftracker.ipv6tracker.org%2Fannounce"  length="1"  type="application/x-bittorrent" ></enclosure>
<author><![CDATA[nekomoekissaten]]></author>
<guid isPermaLink="true" >http://share.dmhy.org/topics/view/711969_01_Sousou_no_Frieren_29_1080p.html</guid>
<category domain="http://share.dmhy.org/topics/list/sort_id/2" ><![CDATA[動畫]]></category>
</item>
<item>
<title><![CDATA[【喵萌奶茶屋】[葬送的芙莉蓮 / Sousou no Frieren][01-28][1080p][繁日雙語][招募翻譯時軸]]]></title>
<link>http://share.dmhy.org/topics/view/671881_Sousou_no_Frieren_01-28_1080p.html</link>
<pubDate>Tue, 11 Jun 2024 14:29:00 +0800</pubDate>
<description><![CDATA[<p><img src="https://s2.loli.net/2023/10/04/2YE8DWOANHUxJKf.png" width="1000px" /></p>
<hr />
<p><img src="https://nekomoe.pages.dev/images/mainVisual/char.jpg" /></p>
<hr />
<p>喵萌奶茶屋招募以下職位的小伙伴！</p>
<p>1.<strong>翻譯</strong>：沒有證書要求，能正確聽譯一集動畫即可</p>
<p>2.<strong>時軸</strong>：使用 Aegisub 準確拉軸對幀並設置合適的樣式、字體、螢幕字</p>
<p>申請請加入 QQ 群 421320480 參加考核，請正確註明應募的職位。</p>
<hr />
<p>奶茶屋所有最新的【<a href="https://github.com/Nekomoekissaten-SUB/Nekomoekissaten-Subs" target="_blank" rel="external nofollow"><strong>外掛字幕</strong></a>】在這裡，若想轉載修改見 repo 的 README。</p>
<hr />
<p>若有問題回報，可以通過 Nekomoekissaten-Subs GitHub repo 的 <a href="https://github.com/Nekomoekissaten-SUB/Nekomoekissaten-Subs/issues" target="_blank" rel="external nofollow"><strong>Issues</strong></a> 或 <a href="https://docs.google.com/forms/d/e/1FAIpQLSfHsIh37P2PI1oQDCEOHyUw2JBqB5db_1ZqY0O06xYqWIFbRA/viewform" target="_blank" rel="external nofollow"><strong>Google 表單</strong></a> 進行回報。
</p>]]></description>
<enclosure url="magnet:?xt=urn:btih:G5K27PF5RXX6TK6O3AIVE3HJMHVZPHSG&amp;dn=&amp;tr=http%3A%2F%2F104.143.10.186%3A8000%2Fannounce&amp;tr=udp%3A%2F%2F104.143.10.186%3A8000%2Fannounce&amp;tr=http%3A%2F%2Ftracker.openbittorrent.com%3A80%2Fannounce&amp;tr=http%3A%2F%2Ftracker3.itzmx.com%3A6961%2Fannounce&amp;tr=http%3A%2F%2Ftracker4.itzmx.com%3A2710%2Fannounce&amp;tr=http%3A%2F%2Ftracker.publicbt.com%3A80%2Fannounce&amp;tr=http%3A%2F%2Ftracker.prq.to%2Fannounce&amp;tr=http%3A%2F%2Fopen.acgtracker.com%3A1096%2Fannounce&amp;tr=https%3A%2F%2Ft-115.rhcloud.com%2Fonly_for_ylbud&amp;tr=http%3A%2F%2Ftracker1.itzmx.com%3A8080%2Fannounce&amp;tr=http%3A%2F%2Ftracker2.itzmx.com%3A6961%2Fannounce&amp;tr=udp%3A%2F%2Ftracker1.itzmx.com%3A8080%2Fannounce&amp;tr=udp%3A%2F%2Ftracker2.itzmx.com%3A6961%2Fannounce&amp;tr=udp%3A%2F%2Ftracker3.itzmx.com%3A6961%2Fannounce&amp;tr=udp%3A%2F%2Ftracker4.itzmx.com%3A2710%2Fannounce&amp;tr=http%3A%2F%2Fnyaa.tracker.wf%3A7777%2Fannounce&amp;tr=http%3A%2F%2Ft.nyaatracker.com%2Fannounce&amp;tr=http%3A%2F%2Ft.acg.rip%3A6699%2Fannounce&amp;tr=http%3A%2F%2Ftr.bangumi.moe%3A6969%2Fannounce&amp;tr=http%3A%2F%2Fshare.camoe.cn%3A8080%2Fannounce&amp;tr=http%3A%2F%2Fsukebei.tracker.wf%3A8888%2Fannounce&amp;tr=http%3A%2F%2Fopenbittorrent.com%3A80%2Fannounce&amp;tr=https%3A%2F%2Fopentracker.i2p.rocks%3A443%2Fannounce&amp;tr=https%3A%2F%2Ftracker.nanoha.org%3A443%2Fannounce&amp;tr=https%3A%2F%2Ftracker.cyber-hub.net%3A443%2Fannounce&amp;tr=https%3A%2F%2Ftr.burnabyhighstar.com%3A443%2Fannounce"  length="1"  type="application/x-bittorrent" ></enclosure>
<author><![CDATA[nekomoekissaten]]></author>
<guid isPermaLink="true" >http://share.dmhy.org/topics/view/671881_Sousou_no_Frieren_01-28_1080p.html</guid>
<category domain="http://share.dmhy.org/topics/list/sort_id/31" ><![CDATA[季度全集]]></category>
</item>
<item>
<title><![CDATA[【喵萌奶茶屋】[葬送的芙莉莲 / Sousou no Frieren][01-28][1080p][简日双语][招募翻译时轴]]]></title>
<link>http://share.dmhy.org/topics/view/671880_Sousou_no_Frieren_01-28_1080p.html</link>
<pubDate>Tue, 11 Jun 2024 14:28:52 +0800</pubDate>
<description><![CDATA[<p><img src="https://s2.loli.net/2023/10/04/2YE8DWOANHUxJKf.png" width="1000px" /></p>
<hr />
<p><img src="https://nekomoe.pages.dev/images/mainVisual/char.jpg" /></p>
<hr />
<p>喵萌奶茶屋招募以下职位的小伙伴！</p>
<p>1.<strong>翻译</strong>：没有证书要求，能正确听译一集动画即可</p>
<p>2.<strong>时轴</strong>：使用 Aegisub 准确拉轴对帧并设置合适的样式、字体、屏幕字</p>
<p>申请请加入 QQ 群 421320480 参加考核，请正确注明应募的职位。</p>
<hr />
<p>奶茶屋所有最新的【<a href="https://github.com/Nekomoekissaten-SUB/Nekomoekissaten-Subs" target="_blank" rel="external nofollow"><strong>外挂字幕</strong></a>】在这里，若想转载修改见 repo 的 README。</p>
<hr />
<p>若有问题回报，可以通过 Nekomoekissaten-Subs GitHub repo 的 <a href="https://github.com/Nekomoekissaten-SUB/Nekomoekissaten-Subs/issues" target="_blank" rel="external nofollow"><strong>Issues</strong></a> 或 <a href="https://docs.google.com/forms/d/e/1FAIpQLSfHsIh37P2PI1oQDCEOHyUw2JBqB5db_1ZqY0O06xYqWIFbRA/viewform" target="_blank" rel="external nofollow"><strong>Google 表单</strong></a> 进行回报。
</p>]]></description>
<enclosure url="magnet:?xt=urn:btih:KVTSVYILFZRQLO3G4J7BA3KUBGHZ7FC5&amp;dn=&amp;tr=http%3A%2F%2F104.143.10.186%3A8000%2Fannounce&amp;tr=udp%3A%2F%2F104.143.10.186%3A8000%2Fannounce&amp;tr=http%3A%2F%2Ftracker.openbittorrent.com%3A80%2Fannounce&amp;tr=http%3A%2F%2Ftracker3.itzmx.com%3A6961%2Fannounce&amp;tr=http%3A%2F%2Ftracker4.itzmx.com%3A2710%2Fannounce&amp;tr=http%3A%2F%2Ftracker.publicbt.com%3A80%2Fannounce&amp;tr=http%3A%2F%2Ftracker.prq.to%2Fannounce&amp;tr=http%3A%2F%2Fopen.acgtracker.com%3A1096%2Fannounce&amp;tr=https%3A%2F%2Ft-115.rhcloud.com%2Fonly_for_ylbud&amp;tr=http%3A%2F%2Ftracker1.itzmx.com%3A8080%2Fannounce&amp;tr=http%3A%2F%2Ftracker2.itzmx.com%3A6961%2Fannounce&amp;tr=udp%3A%2F%2Ftracker1.itzmx.com%3A8080%2Fannounce&amp;tr=udp%3A%2F%2Ftracker2.itzmx.com%3A6961%2Fannounce&amp;tr=udp%3A%2F%2Ftracker3.itzmx.com%3A6961%2Fannounce&amp;tr=udp%3A%2F%2Ftracker4.itzmx.com%3A2710%2Fannounce&amp;tr=http%3A%2F%2Fnyaa.tracker.wf%3A7777%2Fannounce&amp;tr=http%3A%2F%2Ft.nyaatracker.com%2Fannounce&amp;tr=http%3A%2F%2Ft.acg.rip%3A6699%2Fannounce&amp;tr=http%3A%2F%2Ftr.bangumi.moe%3A6969%2Fannounce&amp;tr=http%3A%2F%2Fshare.camoe.cn%3A8080%2Fannounce&amp;tr=http%3A%2F%2Fsukebei.tracker.wf%3A8888%2Fannounce&amp;tr=http%3A%2F%2Fopenbittorrent.com%3A80%2Fannounce&amp;tr=https%3A%2F%2Fopentracker.i2p.rocks%3A443%2Fannounce&amp;tr=https%3A%2F%2Ftracker.nanoha.org%3A443%2Fannounce&amp;tr=https%3A%2F%2Ftracker.cyber-hub.net%3A443%2Fannounce&amp;tr=https%3A%2F%2Ftr.burnabyhighstar.com%3A443%2Fannounce"  length="1"  type="application/x-bittorrent" ></enclosure>
<author><![CDATA[nekomoekissaten]]></author>
<guid isPermaLink="true" >http://share.dmhy.org/topics/view/671880_Sousou_no_Frieren_01-28_1080p.html</guid>
<category domain="http://share.dmhy.org/topics/list/sort_id/31" ><![CDATA[季度全集]]></category>
</item>
<item>
<title><![CDATA[【喵萌奶茶屋】★10月新番★[葬送的芙莉蓮 / Sousou no Frieren][28][1080p][繁日雙語][招募翻譯時軸]]]></title>
<link>http://share.dmhy.org/topics/view/665724_10_Sousou_no_Frieren_28_1080p.html</link>
<pubDate>Fri, 29 Mar 2024 21:01:07 +0800</pubDate>
<description><![CDATA[<p><img src="https://s2.loli.net/2023/10/04/2YE8DWOANHUxJKf.png" width="1000px" /></p>
<hr />
<p><img src="https://nekomoe.pages.dev/images/mainVisual/char.jpg" /></p>
<hr />
<p>喵萌奶茶屋招募以下職位的小伙伴！</p>
<p>1.<strong>翻譯</strong>：沒有證書要求，能正確聽譯一集動畫即可</p>
<p>2.<strong>時軸</strong>：使用 Aegisub 準確拉軸對幀並設置合適的樣式、字體、螢幕字</p>
<p>申請請加入 QQ 群 421320480 參加考核，請正確註明應募的職位。</p>
<hr />
<p>奶茶屋所有最新的【<a href="https://github.com/Nekomoekissaten-SUB/Nekomoekissaten-Subs" target="_blank" rel="external nofollow"><strong>外掛字幕</strong></a>】在這裡，若想轉載修改見 repo 的 README。</p>]]></description>
<enclosure url="magnet:?xt=urn:btih:77QJ7HFXXEL6L5FWFTFXKQ4YPB3ICFGC&amp;dn=&amp;tr=http%3A%2F%2F104.143.10.186%3A8000%2Fannounce&amp;tr=udp%3A%2F%2F104.143.10.186%3A8000%2Fannounce&amp;tr=http%3A%2F%2Ftracker.openbittorrent.com%3A80%2Fannounce&amp;tr=http%3A%2F%2Ftracker3.itzmx.com%3A6961%2Fannounce&amp;tr=http%3A%2F%2Ftracker4.itzmx.com%3A2710%2Fannounce&amp;tr=http%3A%2F%2Ftracker.publicbt.com%3A80%2Fannounce&amp;tr=http%3A%2F%2Ftracker.prq.to%2Fannounce&amp;tr=http%3A%2F%2Fopen.acgtracker.com%3A1096%2Fannounce&amp;tr=https%3A%2F%2Ft-115.rhcloud.com%2Fonly_for_ylbud&amp;tr=http%3A%2F%2Ftracker1.itzmx.com%3A8080%2Fannounce&amp;tr=http%3A%2F%2Ftracker2.itzmx.com%3A6961%2Fannounce&amp;tr=udp%3A%2F%2Ftracker1.itzmx.com%3A8080%2Fannounce&amp;tr=udp%3A%2F%2Ftracker2.itzmx.com%3A6961%2Fannounce&amp;tr=udp%3A%2F%2Ftracker3.itzmx.com%3A6961%2Fannounce&amp;tr=udp%3A%2F%2Ftracker4.itzmx.com%3A2710%2Fannounce&amp;tr=http%3A%2F%2Fnyaa.tracker.wf%3A7777%2Fannounce&amp;tr=http%3A%2F%2Ft.nyaatracker.com%2Fannounce&amp;tr=http%3A%2F%2Ft.acg.rip%3A6699%2Fannounce&amp;tr=http%3A%2F%2Ftr.bangumi.moe%3A6969%2Fannounce&amp;tr=http%3A%2F%2Fshare.camoe.cn%3A8080%2Fannounce&amp;tr=http%3A%2F%2Fsukebei.tracker.wf%3A8888%2Fannounce&amp;tr=http%3A%2F%2Fopenbittorrent.com%3A80%2Fannounce&amp;tr=https%3A%2F%2Fopentracker.i2p.rocks%3A443%2Fannounce&amp;tr=https%3A%2F%2Ftracker.nanoha.org%3A443%2Fannounce&amp;tr=https%3A%2F%2Ftracker.cyber-hub.net%3A443%2Fannounce&amp;tr=https%3A%2F%2Ftr.burnabyhighstar.com%3A443%2Fannounce"  length="1"  type="application/x-bittorrent" ></enclosure>
<author><![CDATA[nekomoekissaten]]></author>
<guid isPermaLink="true" >http://share.dmhy.org/topics/view/665724_10_Sousou_no_Frieren_28_1080p.html</guid>
<category domain="http://share.dmhy.org/topics/list/sort_id/2" ><![CDATA[動畫]]></category>
</item>
<item>
<title><![CDATA[【喵萌奶茶屋】★10月新番★[葬送的芙莉莲 / Sousou no Frieren][28][1080p][简日双语][招募翻译时轴]]]></title>
<link>http://share.dmhy.org/topics/view/665723_10_Sousou_no_Frieren_28_1080p.html</link>
<pubDate>Fri, 29 Mar 2024 21:00:56 +0800</pubDate>
<description><![CDATA[<p><img src="https://s2.loli.net/2023/10/04/2YE8DWOANHUxJKf.png" width="1000px" /></p>
<hr />
<p><img src="https://nekomoe.pages.dev/images/mainVisual/char.jpg" /></p>
<hr />
<p>喵萌奶茶屋招募以下职位的小伙伴！</p>
<p>1.<strong>翻译</strong>：没有证书要求，能正确听译一集动画即可</p>
<p>2.<strong>时轴</strong>：使用 Aegisub 准确拉轴对帧并设置合适的样式、字体、屏幕字</p>
<p>申请请加入 QQ 群 421320480 参加考核，请正确注明应募的职位。</p>
<hr />
<p>奶茶屋所有最新的【<a href="https://github.com/Nekomoekissaten-SUB/Nekomoekissaten-Subs" target="_blank" rel="external nofollow"><strong>外挂字幕</strong></a>】在这里，若想转载修改见 repo 的 README。</p>]]></description>
<enclosure url="magnet:?xt=urn:btih:BM4H3EM46MT2WYGXJCIMAHVPZIILQG72&amp;dn=&amp;tr=http%3A%2F%2F104.143.10.186%3A8000%2Fannounce&amp;tr=udp%3A%2F%2F104.143.10.186%3A8000%2Fannounce&amp;tr=http%3A%2F%2Ftracker.openbittorrent.com%3A80%2Fannounce&amp;tr=http%3A%2F%2Ftracker3.itzmx.com%3A6961%2Fannounce&amp;tr=http%3A%2F%2Ftracker4.itzmx.com%3A2710%2Fannounce&amp;tr=http%3A%2F%2Ftracker.publicbt.com%3A80%2Fannounce&amp;tr=http%3A%2F%2Ftracker.prq.to%2Fannounce&amp;tr=http%3A%2F%2Fopen.acgtracker.com%3A1096%2Fannounce&amp;tr=https%3A%2F%2Ft-115.rhcloud.com%2Fonly_for_ylbud&amp;tr=http%3A%2F%2Ftracker1.itzmx.com%3A8080%2Fannounce&amp;tr=http%3A%2F%2Ftracker2.itzmx.com%3A6961%2Fannounce&amp;tr=udp%3A%2F%2Ftracker1.itzmx.com%3A8080%2Fannounce&amp;tr=udp%3A%2F%2Ftracker2.itzmx.com%3A6961%2Fannounce&amp;tr=udp%3A%2F%2Ftracker3.itzmx.com%3A6961%2Fannounce&amp;tr=udp%3A%2F%2Ftracker4.itzmx.com%3A2710%2Fannounce&amp;tr=http%3A%2F%2Fnyaa.tracker.wf%3A7777%2Fannounce&amp;tr=http%3A%2F%2Ft.nyaatracker.com%2Fannounce&amp;tr=http%3A%2F%2Ft.acg.rip%3A6699%2Fannounce&amp;tr=http%3A%2F%2Ftr.bangumi.moe%3A6969%2Fannounce&amp;tr=http%3A%2F%2Fshare.camoe.cn%3A8080%2Fannounce&amp;tr=http%3A%2F%2Fsukebei.tracker.wf%3A8888%2Fannounce&amp;tr=http%3A%2F%2Fopenbittorrent.com%3A80%2Fannounce&amp;tr=https%3A%2F%2Fopentracker.i2p.rocks%3A443%2Fannounce&amp;tr=https%3A%2F%2Ftracker.nanoha.org%3A443%2Fannounce&amp;tr=https%3A%2F%2Ftracker.cyber-hub.net%3A443%2Fannounce&amp;tr=https%3A%2F%2Ftr.burnabyhighstar.com%3A443%2Fannounce"  length="1"  type="application/x-bittorrent" ></enclosure>
<author><![CDATA[nekomoekissaten]]></author>
<guid isPermaLink="true" >http://share.dmhy.org/topics/view/665723_10_Sousou_no_Frieren_28_1080p.html</guid>
<category domain="http://share.dmhy.org/topics/list/sort_id/2" ><![CDATA[動畫]]></category>
</item>
<item>
<title><![CDATA[【喵萌奶茶屋】★10月新番★[葬送的芙莉蓮 / Sousou no Frieren][27][1080p][繁日雙語][招募翻譯時軸]]]></title>
<link>http://share.dmhy.org/topics/view/665115_10_Sousou_no_Frieren_27_1080p.html</link>
<pubDate>Tue, 19 Mar 2024 19:31:55 +0800</pubDate>
<description><![CDATA[<p><img src="https://s2.loli.net/2023/10/04/2YE8DWOANHUxJKf.png" width="1000px" /></p>
<hr />
<p><img src="https://nekomoe.pages.dev/images/mainVisual/char.jpg" /></p>
<hr />
<p>喵萌奶茶屋招募以下職位的小伙伴！</p>
<p>1.<strong>翻譯</strong>：沒有證書要求，能正確聽譯一集動畫即可</p>
<p>2.<strong>時軸</strong>：使用 Aegisub 準確拉軸對幀並設置合適的樣式、字體、螢幕字</p>
<p>申請請加入 QQ 群 421320480 參加考核，請正確註明應募的職位。</p>
<hr />
<p>奶茶屋所有最新的【<a href="https://github.com/Nekomoekissaten-SUB/Nekomoekissaten-Subs" target="_blank" rel="external nofollow"><strong>外掛字幕</strong></a>】在這裡，若想轉載修改見 repo 的 README。</p>]]></description>
<enclosure url="magnet:?xt=urn:btih:RHCBE2BRP43ET6ADUFHOBRN3V3OBLQ5E&amp;dn=&amp;tr=http%3A%2F%2F104.143.10.186%3A8000%2Fannounce&amp;tr=udp%3A%2F%2F104.143.10.186%3A8000%2Fannounce&amp;tr=http%3A%2F%2Ftracker.openbittorrent.com%3A80%2Fannounce&amp;tr=http%3A%2F%2Ftracker3.itzmx.com%3A6961%2Fannounce&amp;tr=http%3A%2F%2Ftracker4.itzmx.com%3A2710%2Fannounce&amp;tr=http%3A%2F%2Ftracker.publicbt.com%3A80%2Fannounce&amp;tr=http%3A%2F%2Ftracker.prq.to%2Fannounce&amp;tr=http%3A%2F%2Fopen.acgtracker.com%3A1096%2Fannounce&amp;tr=https%3A%2F%2Ft-115.rhcloud.com%2Fonly_for_ylbud&amp;tr=http%3A%2F%2Ftracker1.itzmx.com%3A8080%2Fannounce&amp;tr=http%3A%2F%2Ftracker2.itzmx.com%3A6961%2Fannounce&amp;tr=udp%3A%2F%2Ftracker1.itzmx.com%3A8080%2Fannounce&amp;tr=udp%3A%2F%2Ftracker2.itzmx.com%3A6961%2Fannounce&amp;tr=udp%3A%2F%2Ftracker3.itzmx.com%3A6961%2Fannounce&amp;tr=udp%3A%2F%2Ftracker4.itzmx.com%3A2710%2Fannounce&amp;tr=http%3A%2F%2Fnyaa.tracker.wf%3A7777%2Fannounce&amp;tr=http%3A%2F%2Ft.nyaatracker.com%2Fannounce&amp;tr=http%3A%2F%2Ft.acg.rip%3A6699%2Fannounce&amp;tr=http%3A%2F%2Ftr.bangumi.moe%3A6969%2Fannounce&amp;tr=http%3A%2F%2Fshare.camoe.cn%3A8080%2Fannounce&amp;tr=http%3A%2F%2Fsukebei.tracker.wf%3A8888%2Fannounce&amp;tr=http%3A%2F%2Fopenbittorrent.com%3A80%2Fannounce&amp;tr=https%3A%2F%2Fopentracker.i2p.rocks%3A443%2Fannounce&amp;tr=https%3A%2F%2Ftracker.nanoha.org%3A443%2Fannounce&amp;tr=https%3A%2F%2Ftracker.cyber-hub.net%3A443%2Fannounce&amp;tr=https%3A%2F%2Ftr.burnabyhighstar.com%3A443%2Fannounce"  length="1"  type="application/x-bittorrent" ></enclosure>
<author><![CDATA[nekomoekissaten]]></author>
<guid isPermaLink="true" >http://share.dmhy.org/topics/view/665115_10_Sousou_no_Frieren_27_1080p.html</guid>
<category domain="http://share.dmhy.org/topics/list/sort_id/2" ><![CDATA[動畫]]></category>
</item>
<item>
<title><![CDATA[【喵萌奶茶屋】★10月新番★[葬送的芙莉莲 / Sousou no Frieren][27][1080p][简日双语][招募翻译时轴]]]></title>
<link>http://share.dmhy.org/topics/view/665114_10_Sousou_no_Frieren_27_1080p.html</link>
<pubDate>Tue, 19 Mar 2024 19:31:40 +0800</pubDate>
<description><![CDATA[<p><img src="https://s2.loli.net/2023/10/04/2YE8DWOANHUxJKf.png" width="1000px" /></p>
<hr />
<p><img src="https://nekomoe.pages.dev/images/mainVisual/char.jpg" /></p>
<hr />
<p>喵萌奶茶屋招募以下职位的小伙伴！</p>
<p>1.<strong>翻译</strong>：没有证书要求，能正确听译一集动画即可</p>
<p>2.<strong>时轴</strong>：使用 Aegisub 准确拉轴对帧并设置合适的样式、字体、屏幕字</p>
<p>申请请加入 QQ 群 421320480 参加考核，请正确注明应募的职位。</p>
<hr />
<p>奶茶屋所有最新的【<a href="https://github.com/Nekomoekissaten-SUB/Nekomoekissaten-Subs" target="_blank" rel="external nofollow"><strong>外挂字幕</strong></a>】在这里，若想转载修改见 repo 的 README。</p>]]></description>
<enclosure url="magnet:?xt=urn:btih:KRSJY3ZGDL76GHIBO347Q47SJUHOED67&amp;dn=&amp;tr=http%3A%2F%2F104.143.10.186%3A8000%2Fannounce&amp;tr=udp%3A%2F%2F104.143.10.186%3A8000%2Fannounce&amp;tr=http%3A%2F%2Ftracker.openbittorrent.com%3A80%2Fannounce&amp;tr=http%3A%2F%2Ftracker3.itzmx.com%3A6961%2Fannounce&amp;tr=http%3A%2F%2Ftracker4.itzmx.com%3A2710%2Fannounce&amp;tr=http%3A%2F%2Ftracker.publicbt.com%3A80%2Fannounce&amp;tr=http%3A%2F%2Ftracker.prq.to%2Fannounce&amp;tr=http%3A%2F%2Fopen.acgtracker.com%3A1096%2Fannounce&amp;tr=https%3A%2F%2Ft-115.rhcloud.com%2Fonly_for_ylbud&amp;tr=http%3A%2F%2Ftracker1.itzmx.com%3A8080%2Fannounce&amp;tr=http%3A%2F%2Ftracker2.itzmx.com%3A6961%2Fannounce&amp;tr=udp%3A%2F%2Ftracker1.itzmx.com%3A8080%2Fannounce&amp;tr=udp%3A%2F%2Ftracker2.itzmx.com%3A6961%2Fannounce&amp;tr=udp%3A%2F%2Ftracker3.itzmx.com%3A6961%2Fannounce&amp;tr=udp%3A%2F%2Ftracker4.itzmx.com%3A2710%2Fannounce&amp;tr=http%3A%2F%2Fnyaa.tracker.wf%3A7777%2Fannounce&amp;tr=http%3A%2F%2Ft.nyaatracker.com%2Fannounce&amp;tr=http%3A%2F%2Ft.acg.rip%3A6699%2Fannounce&amp;tr=http%3A%2F%2Ftr.bangumi.moe%3A6969%2Fannounce&amp;tr=http%3A%2F%2Fshare.camoe.cn%3A8080%2Fannounce&amp;tr=http%3A%2F%2Fsukebei.tracker.wf%3A8888%2Fannounce&amp;tr=http%3A%2F%2Fopenbittorrent.com%3A80%2Fannounce&amp;tr=https%3A%2F%2Fopentracker.i2p.rocks%3A443%2Fannounce&amp;tr=https%3A%2F%2Ftracker.nanoha.org%3A443%2Fannounce&amp;tr=https%3A%2F%2Ftracker.cyber-hub.net%3A443%2Fannounce&amp;tr=https%3A%2F%2Ftr.burnabyhighstar.com%3A443%2Fannounce"  length="1"  type="application/x-bittorrent" ></enclosure>
<author><![CDATA[nekomoekissaten]]></author>
<guid isPermaLink="true" >http://share.dmhy.org/topics/view/665114_10_Sousou_no_Frieren_27_1080p.html</guid>
<category domain="http://share.dmhy.org/topics/list/sort_id/2" ><![CDATA[動畫]]></category>
</item>
<item>
<title><![CDATA[【喵萌奶茶屋】★10月新番★[葬送的芙莉蓮 / Sousou no Frieren][26][1080p][繁日雙語][招募翻譯時軸]]]></title>
<link>http://share.dmhy.org/topics/view/664668_10_Sousou_no_Frieren_26_1080p.html</link>
<pubDate>Mon, 11 Mar 2024 07:43:43 +0800</pubDate>
<description><![CDATA[<p><img src="https://s2.loli.net/2023/10/04/2YE8DWOANHUxJKf.png" width="1000px" /></p>
<hr />
<p><img src="https://nekomoe.pages.dev/images/mainVisual/char.jpg" /></p>
<hr />
<p>喵萌奶茶屋招募以下職位的小伙伴！</p>
<p>1.<strong>翻譯</strong>：沒有證書要求，能正確聽譯一集動畫即可</p>
<p>2.<strong>時軸</strong>：使用 Aegisub 準確拉軸對幀並設置合適的樣式、字體、螢幕字</p>
<p>申請請加入 QQ 群 421320480 參加考核，請正確註明應募的職位。</p>
<hr />
<p>奶茶屋所有最新的【<a href="https://github.com/Nekomoekissaten-SUB/Nekomoekissaten-Subs" target="_blank" rel="external nofollow"><strong>外掛字幕</strong></a>】在這裡，若想轉載修改見 repo 的 README。</p>]]></description>
<enclosure url="magnet:?xt=urn:btih:ZOBCTJWDBOCJK7W573WKQG5RF6FYULWX&amp;dn=&amp;tr=http%3A%2F%2F104.143.10.186%3A8000%2Fannounce&amp;tr=udp%3A%2F%2F104.143.10.186%3A8000%2Fannounce&amp;tr=http%3A%2F%2Ftracker.openbittorrent.com%3A80%2Fannounce&amp;tr=http%3A%2F%2Ftracker3.itzmx.com%3A6961%2Fannounce&amp;tr=http%3A%2F%2Ftracker4.itzmx.com%3A2710%2Fannounce&amp;tr=http%3A%2F%2Ftracker.publicbt.com%3A80%2Fannounce&amp;tr=http%3A%2F%2Ftracker.prq.to%2Fannounce&amp;tr=http%3A%2F%2Fopen.acgtracker.com%3A1096%2Fannounce&amp;tr=https%3A%2F%2Ft-115.rhcloud.com%2Fonly_for_ylbud&amp;tr=http%3A%2F%2Ftracker1.itzmx.com%3A8080%2Fannounce&amp;tr=http%3A%2F%2Ftracker2.itzmx.com%3A6961%2Fannounce&amp;tr=udp%3A%2F%2Ftracker1.itzmx.com%3A8080%2Fannounce&amp;tr=udp%3A%2F%2Ftracker2.itzmx.com%3A6961%2Fannounce&amp;tr=udp%3A%2F%2Ftracker3.itzmx.com%3A6961%2Fannounce&amp;tr=udp%3A%2F%2Ftracker4.itzmx.com%3A2710%2Fannounce&amp;tr=http%3A%2F%2Fnyaa.tracker.wf%3A7777%2Fannounce&amp;tr=http%3A%2F%2Ft.nyaatracker.com%2Fannounce&amp;tr=http%3A%2F%2Ft.acg.rip%3A6699%2Fannounce&amp;tr=http%3A%2F%2Ftr.bangumi.moe%3A6969%2Fannounce&amp;tr=http%3A%2F%2Fshare.camoe.cn%3A8080%2Fannounce&amp;tr=http%3A%2F%2Fsukebei.tracker.wf%3A8888%2Fannounce&amp;tr=http%3A%2F%2Fopenbittorrent.com%3A80%2Fannounce&amp;tr=https%3A%2F%2Fopentracker.i2p.rocks%3A443%2Fannounce&amp;tr=https%3A%2F%2Ftracker.nanoha.org%3A443%2Fannounce&amp;tr=https%3A%2F%2Ftracker.cyber-hub.net%3A443%2Fannounce&amp;tr=https%3A%2F%2Ftr.burnabyhighstar.com%3A443%2Fannounce"  length="1"  type="application/x-bittorrent" ></enclosure>
<author><![CDATA[nekomoekissaten]]></author>
<guid isPermaLink="true" >http://share.dmhy.org/topics/view/664668_10_Sousou_no_Frieren_26_1080p.html</guid>
<category domain="http://share.dmhy.org/topics/list/sort_id/2" ><![CDATA[動畫]]></category>
</item>
<item>
<title><![CDATA[【喵萌奶茶屋】★10月新番★[葬送的芙莉莲 / Sousou no Frieren][26][1080p][简日双语][招募翻译时轴]]]></title>
<link>http://share.dmhy.org/topics/view/664667_10_Sousou_no_Frieren_26_1080p.html</link>
<pubDate>Mon, 11 Mar 2024 07:43:31 +0800</pubDate>
<description><![CDATA[<p><img src="https://s2.loli.net/2023/10/04/2YE8DWOANHUxJKf.png" width="1000px" /></p>
<hr />
<p><img src="https://nekomoe.pages.dev/images/mainVisual/char.jpg" /></p>
<hr />
<p>喵萌奶茶屋招募以下职位的小伙伴！</p>
<p>1.<strong>翻译</strong>：没有证书要求，能正确听译一集动画即可</p>
<p>2.<strong>时轴</strong>：使用 Aegisub 准确拉轴对帧并设置合适的样式、字体、屏幕字</p>
<p>申请请加入 QQ 群 421320480 参加考核，请正确注明应募的职位。</p>
<hr />
<p>奶茶屋所有最新的【<a href="https://github.com/Nekomoekissaten-SUB/Nekomoekissaten-Subs" target="_blank" rel="external nofollow"><strong>外挂字幕</strong></a>】在这里，若想转载修改见 repo 的 README。</p>]]></description>
<enclosure url="magnet:?xt=urn:btih:6V7ESXLAMDJGNRTIVD24KE7XB53KIAJN&amp;dn=&amp;tr=http%3A%2F%2F104.143.10.186%3A8000%2Fannounce&amp;tr=udp%3A%2F%2F104.143.10.186%3A8000%2Fannounce&amp;tr=http%3A%2F%2Ftracker.openbittorrent.com%3A80%2Fannounce&amp;tr=http%3A%2F%2Ftracker3.itzmx.com%3A6961%2Fannounce&amp;tr=http%3A%2F%2Ftracker4.itzmx.com%3A2710%2Fannounce&amp;tr=http%3A%2F%2Ftracker.publicbt.com%3A80%2Fannounce&amp;tr=http%3A%2F%2Ftracker.prq.to%2Fannounce&amp;tr=http%3A%2F%2Fopen.acgtracker.com%3A1096%2Fannounce&amp;tr=https%3A%2F%2Ft-115.rhcloud.com%2Fonly_for_ylbud&amp;tr=http%3A%2F%2Ftracker1.itzmx.com%3A8080%2Fannounce&amp;tr=http%3A%2F%2Ftracker2.itzmx.com%3A6961%2Fannounce&amp;tr=udp%3A%2F%2Ftracker1.itzmx.com%3A8080%2Fannounce&amp;tr=udp%3A%2F%2Ftracker2.itzmx.com%3A6961%2Fannounce&amp;tr=udp%3A%2F%2Ftracker3.itzmx.com%3A6961%2Fannounce&amp;tr=udp%3A%2F%2Ftracker4.itzmx.com%3A2710%2Fannounce&amp;tr=http%3A%2F%2Fnyaa.tracker.wf%3A7777%2Fannounce&amp;tr=http%3A%2F%2Ft.nyaatracker.com%2Fannounce&amp;tr=http%3A%2F%2Ft.acg.rip%3A6699%2Fannounce&amp;tr=http%3A%2F%2Ftr.bangumi.moe%3A6969%2Fannounce&amp;tr=http%3A%2F%2Fshare.camoe.cn%3A8080%2Fannounce&amp;tr=http%3A%2F%2Fsukebei.tracker.wf%3A8888%2Fannounce&amp;tr=http%3A%2F%2Fopenbittorrent.com%3A80%2Fannounce&amp;tr=https%3A%2F%2Fopentracker.i2p.rocks%3A443%2Fannounce&amp;tr=https%3A%2F%2Ftracker.nanoha.org%3A443%2Fannounce&amp;tr=https%3A%2F%2Ftracker.cyber-hub.net%3A443%2Fannounce&amp;tr=https%3A%2F%2Ftr.burnabyhighstar.com%3A443%2Fannounce"  length="1"  type="application/x-bittorrent" ></enclosure>
<author><![CDATA[nekomoekissaten]]></author>
<guid isPermaLink="true" >http://share.dmhy.org/topics/view/664667_10_Sousou_no_Frieren_26_1080p.html</guid>
<category domain="http://share.dmhy.org/topics/list/sort_id/2" ><![CDATA[動畫]]></category>
</item>
<item>
<title><![CDATA[【喵萌奶茶屋】★10月新番★[葬送的芙莉蓮 / Sousou no Frieren][25][1080p][繁日雙語][招募翻譯時軸]]]></title>
<link>http://share.dmhy.org/topics/view/664142_10_Sousou_no_Frieren_25_1080p.html</link>
<pubDate>Mon, 04 Mar 2024 20:04:45 +0800</pubDate>
<description><![CDATA[<p><img src="https://s2.loli.net/2023/10/04/2YE8DWOANHUxJKf.png" width="1000px" /></p>
<hr />
<p><img src="https://nekomoe.pages.dev/images/mainVisual/char.jpg" /></p>
<hr />
<p>喵萌奶茶屋招募以下職位的小伙伴！</p>
<p>1.<strong>翻譯</strong>：沒有證書要求，能正確聽譯一集動畫即可</p>
<p>2.<strong>時軸</strong>：使用 Aegisub 準確拉軸對幀並設置合適的樣式、字體、螢幕字</p>
<p>申請請加入 QQ 群 421320480 參加考核，請正確註明應募的職位。</p>
<hr />
<p>奶茶屋所有最新的【<a href="https://github.com/Nekomoekissaten/Nekomoekissaten-Subs" target="_blank" rel="external nofollow"><strong>外掛字幕</strong></a>】在這裡，若想轉載修改見 repo 的 README。</p>]]></description>
<enclosure url="magnet:?xt=urn:btih:EK2AZ2XBCMRJUBULPKL22NRGZOK3FGVP&amp;dn=&amp;tr=http%3A%2F%2F104.143.10.186%3A8000%2Fannounce&amp;tr=udp%3A%2F%2F104.143.10.186%3A8000%2Fannounce&amp;tr=http%3A%2F%2Ftracker.openbittorrent.com%3A80%2Fannounce&amp;tr=http%3A%2F%2Ftracker3.itzmx.com%3A6961%2Fannounce&amp;tr=http%3A%2F%2Ftracker4.itzmx.com%3A2710%2Fannounce&amp;tr=http%3A%2F%2Ftracker.publicbt.com%3A80%2Fannounce&amp;tr=http%3A%2F%2Ftracker.prq.to%2Fannounce&amp;tr=http%3A%2F%2Fopen.acgtracker.com%3A1096%2Fannounce&amp;tr=https%3A%2F%2Ft-115.rhcloud.com%2Fonly_for_ylbud&amp;tr=http%3A%2F%2Ftracker1.itzmx.com%3A8080%2Fannounce&amp;tr=http%3A%2F%2Ftracker2.itzmx.com%3A6961%2Fannounce&amp;tr=udp%3A%2F%2Ftracker1.itzmx.com%3A8080%2Fannounce&amp;tr=udp%3A%2F%2Ftracker2.itzmx.com%3A6961%2Fannounce&amp;tr=udp%3A%2F%2Ftracker3.itzmx.com%3A6961%2Fannounce&amp;tr=udp%3A%2F%2Ftracker4.itzmx.com%3A2710%2Fannounce&amp;tr=http%3A%2F%2Fnyaa.tracker.wf%3A7777%2Fannounce&amp;tr=http%3A%2F%2Ft.nyaatracker.com%2Fannounce&amp;tr=http%3A%2F%2Ft.acg.rip%3A6699%2Fannounce&amp;tr=http%3A%2F%2Ftr.bangumi.moe%3A6969%2Fannounce&amp;tr=http%3A%2F%2Fshare.camoe.cn%3A8080%2Fannounce&amp;tr=http%3A%2F%2Fsukebei.tracker.wf%3A8888%2Fannounce&amp;tr=http%3A%2F%2Fopenbittorrent.com%3A80%2Fannounce&amp;tr=https%3A%2F%2Fopentracker.i2p.rocks%3A443%2Fannounce&amp;tr=https%3A%2F%2Ftracker.nanoha.org%3A443%2Fannounce&amp;tr=https%3A%2F%2Ftracker.cyber-hub.net%3A443%2Fannounce&amp;tr=https%3A%2F%2Ftr.burnabyhighstar.com%3A443%2Fannounce"  length="1"  type="application/x-bittorrent" ></enclosure>
<author><![CDATA[nekomoekissaten]]></author>
<guid isPermaLink="true" >http://share.dmhy.org/topics/view/664142_10_Sousou_no_Frieren_25_1080p.html</guid>
<category domain="http://share.dmhy.org/topics/list/sort_id/2" ><![CDATA[動畫]]></category>
</item>
<item>
<title><![CDATA[【喵萌奶茶屋】★10月新番★[葬送的芙莉莲 / Sousou no Frieren][25][1080p][简日双语][招募翻译时轴]]]></title>
<link>http://share.dmhy.org/topics/view/664141_10_Sousou_no_Frieren_25_1080p.html</link>
<pubDate>Mon, 04 Mar 2024 20:04:35 +0800</pubDate>
<description><![CDATA[<p><img src="https://s2.loli.net/2023/10/04/2YE8DWOANHUxJKf.png" width="1000px" /></p>
<hr />
<p><img src="https://nekomoe.pages.dev/images/mainVisual/char.jpg" /></p>
<hr />
<p>喵萌奶茶屋招募以下职位的小伙伴！</p>
<p>1.<strong>翻译</strong>：没有证书要求，能正确听译一集动画即可</p>
<p>2.<strong>时轴</strong>：使用 Aegisub 准确拉轴对帧并设置合适的样式、字体、屏幕字</p>
<p>申请请加入 QQ 群 421320480 参加考核，请正确注明应募的职位。</p>
<hr />
<p>奶茶屋所有最新的【<a href="https://github.com/Nekomoekissaten/Nekomoekissaten-Subs" target="_blank" rel="external nofollow"><strong>外挂字幕</strong></a>】在这里，若想转载修改见 repo 的 README。</p>]]></description>
<enclosure url="magnet:?xt=urn:btih:6NL3NOPLABOEPBF6C7JHP2ZC3AUTBG3A&amp;dn=&amp;tr=http%3A%2F%2F104.143.10.186%3A8000%2Fannounce&amp;tr=udp%3A%2F%2F104.143.10.186%3A8000%2Fannounce&amp;tr=http%3A%2F%2Ftracker.openbittorrent.com%3A80%2Fannounce&amp;tr=http%3A%2F%2Ftracker3.itzmx.com%3A6961%2Fannounce&amp;tr=http%3A%2F%2Ftracker4.itzmx.com%3A2710%2Fannounce&amp;tr=http%3A%2F%2Ftracker.publicbt.com%3A80%2Fannounce&amp;tr=http%3A%2F%2Ftracker.prq.to%2Fannounce&amp;tr=http%3A%2F%2Fopen.acgtracker.com%3A1096%2Fannounce&amp;tr=https%3A%2F%2Ft-115.rhcloud.com%2Fonly_for_ylbud&amp;tr=http%3A%2F%2Ftracker1.itzmx.com%3A8080%2Fannounce&amp;tr=http%3A%2F%2Ftracker2.itzmx.com%3A6961%2Fannounce&amp;tr=udp%3A%2F%2Ftracker1.itzmx.com%3A8080%2Fannounce&amp;tr=udp%3A%2F%2Ftracker2.itzmx.com%3A6961%2Fannounce&amp;tr=udp%3A%2F%2Ftracker3.itzmx.com%3A6961%2Fannounce&amp;tr=udp%3A%2F%2Ftracker4.itzmx.com%3A2710%2Fannounce&amp;tr=http%3A%2F%2Fnyaa.tracker.wf%3A7777%2Fannounce&amp;tr=http%3A%2F%2Ft.nyaatracker.com%2Fannounce&amp;tr=http%3A%2F%2Ft.acg.rip%3A6699%2Fannounce&amp;tr=http%3A%2F%2Ftr.bangumi.moe%3A6969%2Fannounce&amp;tr=http%3A%2F%2Fshare.camoe.cn%3A8080%2Fannounce&amp;tr=http%3A%2F%2Fsukebei.tracker.wf%3A8888%2Fannounce&amp;tr=http%3A%2F%2Fopenbittorrent.com%3A80%2Fannounce&amp;tr=https%3A%2F%2Fopentracker.i2p.rocks%3A443%2Fannounce&amp;tr=https%3A%2F%2Ftracker.nanoha.org%3A443%2Fannounce&amp;tr=https%3A%2F%2Ftracker.cyber-hub.net%3A443%2Fannounce&amp;tr=https%3A%2F%2Ftr.burnabyhighstar.com%3A443%2Fannounce"  length="1"  type="application/x-bittorrent" ></enclosure>
<author><![CDATA[nekomoekissaten]]></author>
<guid isPermaLink="true" >http://share.dmhy.org/topics/view/664141_10_Sousou_no_Frieren_25_1080p.html</guid>
<category domain="http://share.dmhy.org/topics/list/sort_id/2" ><![CDATA[動畫]]></category>
</item>
<item>
<title><![CDATA[【喵萌奶茶屋】★10月新番★[葬送的芙莉蓮 / Sousou no Frieren][24][1080p][繁日雙語][招募翻譯時軸]]]></title>
<link>http://share.dmhy.org/topics/view/663799_10_Sousou_no_Frieren_24_1080p.html</link>
<pubDate>Thu, 29 Feb 2024 07:09:47 +0800</pubDate>
<description><![CDATA[<p><img src="https://s2.loli.net/2023/10/04/2YE8DWOANHUxJKf.png" width="1000px" /></p>
<hr />
<p><img src="https://nekomoe.pages.dev/images/mainVisual/char.jpg" /></p>
<hr />
<p>喵萌奶茶屋招募以下職位的小伙伴！</p>
<p>1.<strong>翻譯</strong>：沒有證書要求，能正確聽譯一集動畫即可</p>
<p>2.<strong>時軸</strong>：使用 Aegisub 準確拉軸對幀並設置合適的樣式、字體、螢幕字</p>
<p>申請請加入 QQ 群 421320480 參加考核，請正確註明應募的職位。</p>
<hr />
<p>奶茶屋所有最新的【<a href="https://github.com/Nekomoekissaten/Nekomoekissaten-Subs" target="_blank" rel="external nofollow"><strong>外掛字幕</strong></a>】在這裡，若想轉載修改見 repo 的 README。</p>]]></description>
<enclosure url="magnet:?xt=urn:btih:NPMUMBPSLXOLFEKO5QGCAXGOD75J7BHX&amp;dn=&amp;tr=http%3A%2F%2F104.143.10.186%3A8000%2Fannounce&amp;tr=udp%3A%2F%2F104.143.10.186%3A8000%2Fannounce&amp;tr=http%3A%2F%2Ftracker.openbittorrent.com%3A80%2Fannounce&amp;tr=http%3A%2F%2Ftracker3.itzmx.com%3A6961%2Fannounce&amp;tr=http%3A%2F%2Ftracker4.itzmx.com%3A2710%2Fannounce&amp;tr=http%3A%2F%2Ftracker.publicbt.com%3A80%2Fannounce&amp;tr=http%3A%2F%2Ftracker.prq.to%2Fannounce&amp;tr=http%3A%2F%2Fopen.acgtracker.com%3A1096%2Fannounce&amp;tr=https%3A%2F%2Ft-115.rhcloud.com%2Fonly_for_ylbud&amp;tr=http%3A%2F%2Ftracker1.itzmx.com%3A8080%2Fannounce&amp;tr=http%3A%2F%2Ftracker2.itzmx.com%3A6961%2Fannounce&amp;tr=udp%3A%2F%2Ftracker1.itzmx.com%3A8080%2Fannounce&amp;tr=udp%3A%2F%2Ftracker2.itzmx.com%3A6961%2Fannounce&amp;tr=udp%3A%2F%2Ftracker3.itzmx.com%3A6961%2Fannounce&amp;tr=udp%3A%2F%2Ftracker4.itzmx.com%3A2710%2Fannounce&amp;tr=http%3A%2F%2Fnyaa.tracker.wf%3A7777%2Fannounce&amp;tr=http%3A%2F%2Ft.nyaatracker.com%2Fannounce&amp;tr=http%3A%2F%2Ft.acg.rip%3A6699%2Fannounce&amp;tr=http%3A%2F%2Ftr.bangumi.moe%3A6969%2Fannounce&amp;tr=http%3A%2F%2Fshare.camoe.cn%3A8080%2Fannounce&amp;tr=http%3A%2F%2Fsukebei.tracker.wf%3A8888%2Fannounce&amp;tr=http%3A%2F%2Fopenbittorrent.com%3A80%2Fannounce&amp;tr=https%3A%2F%2Fopentracker.i2p.rocks%3A443%2Fannounce&amp;tr=https%3A%2F%2Ftracker.nanoha.org%3A443%2Fannounce&amp;tr=https%3A%2F%2Ftracker.cyber-hub.net%3A443%2Fannounce&amp;tr=https%3A%2F%2Ftr.burnabyhighstar.com%3A443%2Fannounce"  length="1"  type="application/x-bittorrent" ></enclosure>
<author><![CDATA[nekomoekissaten]]></author>
<guid isPermaLink="true" >http://share.dmhy.org/topics/view/663799_10_Sousou_no_Frieren_24_1080p.html</guid>
<category domain="http://share.dmhy.org/topics/list/sort_id/2" ><![CDATA[動畫]]></category>
</item>
<item>
<title><![CDATA[【喵萌奶茶屋】★10月新番★[葬送的芙莉莲 / Sousou no Frieren][24][1080p][简日双语][招募翻译时轴]]]></title>
<link>http://share.dmhy.org/topics/view/663798_10_Sousou_no_Frieren_24_1080p.html</link>
<pubDate>Thu, 29 Feb 2024 07:09:37 +0800</pubDate>
<description><![CDATA[<p><img src="https://s2.loli.net/2023/10/04/2YE8DWOANHUxJKf.png" width="1000px" /></p>
<hr />
<p><img src="https://nekomoe.pages.dev/images/mainVisual/char.jpg" /></p>
<hr />
<p>喵萌奶茶屋招募以下职位的小伙伴！</p>
<p>1.<strong>翻译</strong>：没有证书要求，能正确听译一集动画即可</p>
<p>2.<strong>时轴</strong>：使用 Aegisub 准确拉轴对帧并设置合适的样式、字体、屏幕字</p>
<p>申请请加入 QQ 群 421320480 参加考核，请正确注明应募的职位。</p>
<hr />
<p>奶茶屋所有最新的【<a href="https://github.com/Nekomoekissaten/Nekomoekissaten-Subs" target="_blank" rel="external nofollow"><strong>外挂字幕</strong></a>】在这里，若想转载修改见 repo 的 README。</p>]]></description>
<enclosure url="magnet:?xt=urn:btih:7OEIWXMNGRYZLA53O3WAYYQ5PMLZNY3N&amp;dn=&amp;tr=http%3A%2F%2F104.143.10.186%3A8000%2Fannounce&amp;tr=udp%3A%2F%2F104.143.10.186%3A8000%2Fannounce&amp;tr=http%3A%2F%2Ftracker.openbittorrent.com%3A80%2Fannounce&amp;tr=http%3A%2F%2Ftracker3.itzmx.com%3A6961%2Fannounce&amp;tr=http%3A%2F%2Ftracker4.itzmx.com%3A2710%2Fannounce&amp;tr=http%3A%2F%2Ftracker.publicbt.com%3A80%2Fannounce&amp;tr=http%3A%2F%2Ftracker.prq.to%2Fannounce&amp;tr=http%3A%2F%2Fopen.acgtracker.com%3A1096%2Fannounce&amp;tr=https%3A%2F%2Ft-115.rhcloud.com%2Fonly_for_ylbud&amp;tr=http%3A%2F%2Ftracker1.itzmx.com%3A8080%2Fannounce&amp;tr=http%3A%2F%2Ftracker2.itzmx.com%3A6961%2Fannounce&amp;tr=udp%3A%2F%2Ftracker1.itzmx.com%3A8080%2Fannounce&amp;tr=udp%3A%2F%2Ftracker2.itzmx.com%3A6961%2Fannounce&amp;tr=udp%3A%2F%2Ftracker3.itzmx.com%3A6961%2Fannounce&amp;tr=udp%3A%2F%2Ftracker4.itzmx.com%3A2710%2Fannounce&amp;tr=http%3A%2F%2Fnyaa.tracker.wf%3A7777%2Fannounce&amp;tr=http%3A%2F%2Ft.nyaatracker.com%2Fannounce&amp;tr=http%3A%2F%2Ft.acg.rip%3A6699%2Fannounce&amp;tr=http%3A%2F%2Ftr.bangumi.moe%3A6969%2Fannounce&amp;tr=http%3A%2F%2Fshare.camoe.cn%3A8080%2Fannounce&amp;tr=http%3A%2F%2Fsukebei.tracker.wf%3A8888%2Fannounce&amp;tr=http%3A%2F%2Fopenbittorrent.com%3A80%2Fannounce&amp;tr=https%3A%2F%2Fopentracker.i2p.rocks%3A443%2Fannounce&amp;tr=https%3A%2F%2Ftracker.nanoha.org%3A443%2Fannounce&amp;tr=https%3A%2F%2Ftracker.cyber-hub.net%3A443%2Fannounce&amp;tr=https%3A%2F%2Ftr.burnabyhighstar.com%3A443%2Fannounce"  length="1"  type="application/x-bittorrent" ></enclosure>
<author><![CDATA[nekomoekissaten]]></author>
<guid isPermaLink="true" >http://share.dmhy.org/topics/view/663798_10_Sousou_no_Frieren_24_1080p.html</guid>
<category domain="http://share.dmhy.org/topics/list/sort_id/2" ><![CDATA[動畫]]></category>
</item>
<item>
<title><![CDATA[【喵萌奶茶屋】★10月新番★[葬送的芙莉蓮 / Sousou no Frieren][23][1080p][繁日雙語][招募翻譯時軸]]]></title>
<link>http://share.dmhy.org/topics/view/663302_10_Sousou_no_Frieren_23_1080p.html</link>
<pubDate>Thu, 22 Feb 2024 08:47:28 +0800</pubDate>
<description><![CDATA[<p><img src="https://s2.loli.net/2023/10/04/2YE8DWOANHUxJKf.png" width="1000px" /></p>
<hr />
<p><img src="https://nekomoe.pages.dev/images/mainVisual/char.jpg" /></p>
<hr />
<p>喵萌奶茶屋招募以下職位的小伙伴！</p>
<p>1.<strong>翻譯</strong>：沒有證書要求，能正確聽譯一集動畫即可</p>
<p>2.<strong>時軸</strong>：使用 Aegisub 準確拉軸對幀並設置合適的樣式、字體、螢幕字</p>
<p>申請請加入 QQ 群 421320480 參加考核，請正確註明應募的職位。</p>
<hr />
<p>奶茶屋所有最新的【<a href="https://github.com/Nekomoekissaten/Nekomoekissaten-Subs" target="_blank" rel="external nofollow"><strong>外掛字幕</strong></a>】在這裡，若想轉載修改見 repo 的 README。</p>]]></description>
<enclosure url="magnet:?xt=urn:btih:V73HK3HEQWAK6MWQKW652DEVSBAFMMSL&amp;dn=&amp;tr=http%3A%2F%2F104.143.10.186%3A8000%2Fannounce&amp;tr=udp%3A%2F%2F104.143.10.186%3A8000%2Fannounce&amp;tr=http%3A%2F%2Ftracker.openbittorrent.com%3A80%2Fannounce&amp;tr=http%3A%2F%2Ftracker3.itzmx.com%3A6961%2Fannounce&amp;tr=http%3A%2F%2Ftracker4.itzmx.com%3A2710%2Fannounce&amp;tr=http%3A%2F%2Ftracker.publicbt.com%3A80%2Fannounce&amp;tr=http%3A%2F%2Ftracker.prq.to%2Fannounce&amp;tr=http%3A%2F%2Fopen.acgtracker.com%3A1096%2Fannounce&amp;tr=https%3A%2F%2Ft-115.rhcloud.com%2Fonly_for_ylbud&amp;tr=http%3A%2F%2Ftracker1.itzmx.com%3A8080%2Fannounce&amp;tr=http%3A%2F%2Ftracker2.itzmx.com%3A6961%2Fannounce&amp;tr=udp%3A%2F%2Ftracker1.itzmx.com%3A8080%2Fannounce&amp;tr=udp%3A%2F%2Ftracker2.itzmx.com%3A6961%2Fannounce&amp;tr=udp%3A%2F%2Ftracker3.itzmx.com%3A6961%2Fannounce&amp;tr=udp%3A%2F%2Ftracker4.itzmx.com%3A2710%2Fannounce&amp;tr=http%3A%2F%2Fnyaa.tracker.wf%3A7777%2Fannounce&amp;tr=http%3A%2F%2Ft.nyaatracker.com%2Fannounce&amp;tr=http%3A%2F%2Ft.acg.rip%3A6699%2Fannounce&amp;tr=http%3A%2F%2Ftr.bangumi.moe%3A6969%2Fannounce&amp;tr=http%3A%2F%2Fshare.camoe.cn%3A8080%2Fannounce&amp;tr=http%3A%2F%2Fsukebei.tracker.wf%3A8888%2Fannounce&amp;tr=http%3A%2F%2Fopenbittorrent.com%3A80%2Fannounce&amp;tr=https%3A%2F%2Fopentracker.i2p.rocks%3A443%2Fannounce&amp;tr=https%3A%2F%2Ftracker.nanoha.org%3A443%2Fannounce&amp;tr=https%3A%2F%2Ftracker.cyber-hub.net%3A443%2Fannounce&amp;tr=https%3A%2F%2Ftr.burnabyhighstar.com%3A443%2Fannounce"  length="1"  type="application/x-bittorrent" ></enclosure>
<author><![CDATA[nekomoekissaten]]></author>
<guid isPermaLink="true" >http://share.dmhy.org/topics/view/663302_10_Sousou_no_Frieren_23_1080p.html</guid>
<category domain="http://share.dmhy.org/topics/list/sort_id/2" ><![CDATA[動畫]]></category>
</item>
<item>
<title><![CDATA[【喵萌奶茶屋】★10月新番★[葬送的芙莉莲 / Sousou no Frieren][23][1080p][简日双语][招募翻译时轴]]]></title>
<link>http://share.dmhy.org/topics/view/663301_10_Sousou_no_Frieren_23_1080p.html</link>
<pubDate>Thu, 22 Feb 2024 08:47:18 +0800</pubDate>
<description><![CDATA[<p><img src="https://s2.loli.net/2023/10/04/2YE8DWOANHUxJKf.png" width="1000px" /></p>
<hr />
<p><img src="https://nekomoe.pages.dev/images/mainVisual/char.jpg" /></p>
<hr />
<p>喵萌奶茶屋招募以下职位的小伙伴！</p>
<p>1.<strong>翻译</strong>：没有证书要求，能正确听译一集动画即可</p>
<p>2.<strong>时轴</strong>：使用 Aegisub 准确拉轴对帧并设置合适的样式、字体、屏幕字</p>
<p>申请请加入 QQ 群 421320480 参加考核，请正确注明应募的职位。</p>
<hr />
<p>奶茶屋所有最新的【<a href="https://github.com/Nekomoekissaten/Nekomoekissaten-Subs" target="_blank" rel="external nofollow"><strong>外挂字幕</strong></a>】在这里，若想转载修改见 repo 的 README。</p>]]></description>
<enclosure url="magnet:?xt=urn:btih:3TPA6SJULZ47BOFNZJNEPSIZS4IYAMCK&amp;dn=&amp;tr=http%3A%2F%2F104.143.10.186%3A8000%2Fannounce&amp;tr=udp%3A%2F%2F104.143.10.186%3A8000%2Fannounce&amp;tr=http%3A%2F%2Ftracker.openbittorrent.com%3A80%2Fannounce&amp;tr=http%3A%2F%2Ftracker3.itzmx.com%3A6961%2Fannounce&amp;tr=http%3A%2F%2Ftracker4.itzmx.com%3A2710%2Fannounce&amp;tr=http%3A%2F%2Ftracker.publicbt.com%3A80%2Fannounce&amp;tr=http%3A%2F%2Ftracker.prq.to%2Fannounce&amp;tr=http%3A%2F%2Fopen.acgtracker.com%3A1096%2Fannounce&amp;tr=https%3A%2F%2Ft-115.rhcloud.com%2Fonly_for_ylbud&amp;tr=http%3A%2F%2Ftracker1.itzmx.com%3A8080%2Fannounce&amp;tr=http%3A%2F%2Ftracker2.itzmx.com%3A6961%2Fannounce&amp;tr=udp%3A%2F%2Ftracker1.itzmx.com%3A8080%2Fannounce&amp;tr=udp%3A%2F%2Ftracker2.itzmx.com%3A6961%2Fannounce&amp;tr=udp%3A%2F%2Ftracker3.itzmx.com%3A6961%2Fannounce&amp;tr=udp%3A%2F%2Ftracker4.itzmx.com%3A2710%2Fannounce&amp;tr=http%3A%2F%2Fnyaa.tracker.wf%3A7777%2Fannounce&amp;tr=http%3A%2F%2Ft.nyaatracker.com%2Fannounce&amp;tr=http%3A%2F%2Ft.acg.rip%3A6699%2Fannounce&amp;tr=http%3A%2F%2Ftr.bangumi.moe%3A6969%2Fannounce&amp;tr=http%3A%2F%2Fshare.camoe.cn%3A8080%2Fannounce&amp;tr=http%3A%2F%2Fsukebei.tracker.wf%3A8888%2Fannounce&amp;tr=http%3A%2F%2Fopenbittorrent.com%3A80%2Fannounce&amp;tr=https%3A%2F%2Fopentracker.i2p.rocks%3A443%2Fannounce&amp;tr=https%3A%2F%2Ftracker.nanoha.org%3A443%2Fannounce&amp;tr=https%3A%2F%2Ftracker.cyber-hub.net%3A443%2Fannounce&amp;tr=https%3A%2F%2Ftr.burnabyhighstar.com%3A443%2Fannounce"  length="1"  type="application/x-bittorrent" ></enclosure>
<author><![CDATA[nekomoekissaten]]></author>
<guid isPermaLink="true" >http://share.dmhy.org/topics/view/663301_10_Sousou_no_Frieren_23_1080p.html</guid>
<category domain="http://share.dmhy.org/topics/list/sort_id/2" ><![CDATA[動畫]]></category>
</item>
<item>
<title><![CDATA[【喵萌奶茶屋】★10月新番★[葬送的芙莉蓮 / Sousou no Frieren][22][1080p][繁日雙語][招募翻譯時軸]]]></title>
<link>http://share.dmhy.org/topics/view/662813_10_Sousou_no_Frieren_22_1080p.html</link>
<pubDate>Thu, 15 Feb 2024 09:38:51 +0800</pubDate>
<description><![CDATA[<p><img src="https://s2.loli.net/2023/10/04/2YE8DWOANHUxJKf.png" width="1000px" /></p>
<hr />
<p><img src="https://nekomoe.pages.dev/images/mainVisual/char.jpg" /></p>
<hr />
<p>喵萌奶茶屋招募以下職位的小伙伴！</p>
<p>1.<strong>翻譯</strong>：沒有證書要求，能正確聽譯一集動畫即可</p>
<p>2.<strong>時軸</strong>：使用 Aegisub 準確拉軸對幀並設置合適的樣式、字體、螢幕字</p>
<p>申請請加入 QQ 群 421320480 參加考核，請正確註明應募的職位。</p>
<hr />
<p>奶茶屋所有最新的【<a href="https://github.com/Nekomoekissaten/Nekomoekissaten-Subs" target="_blank" rel="external nofollow"><strong>外掛字幕</strong></a>】在這裡，若想轉載修改見 repo 的 README。</p>]]></description>
<enclosure url="magnet:?xt=urn:btih:ZB2XHQIOUROFKSL6DMUAQGFIJGH6QH2A&amp;dn=&amp;tr=http%3A%2F%2F104.143.10.186%3A8000%2Fannounce&amp;tr=udp%3A%2F%2F104.143.10.186%3A8000%2Fannounce&amp;tr=http%3A%2F%2Ftracker.openbittorrent.com%3A80%2Fannounce&amp;tr=http%3A%2F%2Ftracker3.itzmx.com%3A6961%2Fannounce&amp;tr=http%3A%2F%2Ftracker4.itzmx.com%3A2710%2Fannounce&amp;tr=http%3A%2F%2Ftracker.publicbt.com%3A80%2Fannounce&amp;tr=http%3A%2F%2Ftracker.prq.to%2Fannounce&amp;tr=http%3A%2F%2Fopen.acgtracker.com%3A1096%2Fannounce&amp;tr=https%3A%2F%2Ft-115.rhcloud.com%2Fonly_for_ylbud&amp;tr=http%3A%2F%2Ftracker1.itzmx.com%3A8080%2Fannounce&amp;tr=http%3A%2F%2Ftracker2.itzmx.com%3A6961%2Fannounce&amp;tr=udp%3A%2F%2Ftracker1.itzmx.com%3A8080%2Fannounce&amp;tr=udp%3A%2F%2Ftracker2.itzmx.com%3A6961%2Fannounce&amp;tr=udp%3A%2F%2Ftracker3.itzmx.com%3A6961%2Fannounce&amp;tr=udp%3A%2F%2Ftracker4.itzmx.com%3A2710%2Fannounce&amp;tr=http%3A%2F%2Fnyaa.tracker.wf%3A7777%2Fannounce&amp;tr=http%3A%2F%2Ft.nyaatracker.com%2Fannounce&amp;tr=http%3A%2F%2Ft.acg.rip%3A6699%2Fannounce&amp;tr=http%3A%2F%2Ftr.bangumi.moe%3A6969%2Fannounce&amp;tr=http%3A%2F%2Fshare.camoe.cn%3A8080%2Fannounce&amp;tr=http%3A%2F%2Fsukebei.tracker.wf%3A8888%2Fannounce&amp;tr=http%3A%2F%2Fopenbittorrent.com%3A80%2Fannounce&amp;tr=https%3A%2F%2Fopentracker.i2p.rocks%3A443%2Fannounce&amp;tr=https%3A%2F%2Ftracker.nanoha.org%3A443%2Fannounce&amp;tr=https%3A%2F%2Ftracker.cyber-hub.net%3A443%2Fannounce&amp;tr=https%3A%2F%2Ftr.burnabyhighstar.com%3A443%2Fannounce"  length="1"  type="application/x-bittorrent" ></enclosure>
<author><![CDATA[nekomoekissaten]]></author>
<guid isPermaLink="true" >http://share.dmhy.org/topics/view/662813_10_Sousou_no_Frieren_22_1080p.html</guid>
<category domain="http://share.dmhy.org/topics/list/sort_id/2" ><![CDATA[動畫]]></category>
</item>
<item>
<title><![CDATA[【喵萌奶茶屋】★10月新番★[葬送的芙莉莲 / Sousou no Frieren][22][1080p][简日双语][招募翻译时轴]]]></title>
<link>http://share.dmhy.org/topics/view/662812_10_Sousou_no_Frieren_22_1080p.html</link>
<pubDate>Thu, 15 Feb 2024 09:38:35 +0800</pubDate>
<description><![CDATA[<p><img src="https://s2.loli.net/2023/10/04/2YE8DWOANHUxJKf.png" width="1000px" /></p>
<hr />
<p><img src="https://nekomoe.pages.dev/images/mainVisual/char.jpg" /></p>
<hr />
<p>喵萌奶茶屋招募以下职位的小伙伴！</p>
<p>1.<strong>翻译</strong>：没有证书要求，能正确听译一集动画即可</p>
<p>2.<strong>时轴</strong>：使用 Aegisub 准确拉轴对帧并设置合适的样式、字体、屏幕字</p>
<p>申请请加入 QQ 群 421320480 参加考核，请正确注明应募的职位。</p>
<hr />
<p>奶茶屋所有最新的【<a href="https://github.com/Nekomoekissaten/Nekomoekissaten-Subs" target="_blank" rel="external nofollow"><strong>外挂字幕</strong></a>】在这里，若想转载修改见 repo 的 README。</p>]]></description>
<enclosure url="magnet:?xt=urn:btih:6Z3QZVKP5TEIX6V3ZDZOFEJELES5D7KX&amp;dn=&amp;tr=http%3A%2F%2F104.143.10.186%3A8000%2Fannounce&amp;tr=udp%3A%2F%2F104.143.10.186%3A8000%2Fannounce&amp;tr=http%3A%2F%2Ftracker.openbittorrent.com%3A80%2Fannounce&amp;tr=http%3A%2F%2Ftracker3.itzmx.com%3A6961%2Fannounce&amp;tr=http%3A%2F%2Ftracker4.itzmx.com%3A2710%2Fannounce&amp;tr=http%3A%2F%2Ftracker.publicbt.com%3A80%2Fannounce&amp;tr=http%3A%2F%2Ftracker.prq.to%2Fannounce&amp;tr=http%3A%2F%2Fopen.acgtracker.com%3A1096%2Fannounce&amp;tr=https%3A%2F%2Ft-115.rhcloud.com%2Fonly_for_ylbud&amp;tr=http%3A%2F%2Ftracker1.itzmx.com%3A8080%2Fannounce&amp;tr=http%3A%2F%2Ftracker2.itzmx.com%3A6961%2Fannounce&amp;tr=udp%3A%2F%2Ftracker1.itzmx.com%3A8080%2Fannounce&amp;tr=udp%3A%2F%2Ftracker2.itzmx.com%3A6961%2Fannounce&amp;tr=udp%3A%2F%2Ftracker3.itzmx.com%3A6961%2Fannounce&amp;tr=udp%3A%2F%2Ftracker4.itzmx.com%3A2710%2Fannounce&amp;tr=http%3A%2F%2Fnyaa.tracker.wf%3A7777%2Fannounce&amp;tr=http%3A%2F%2Ft.nyaatracker.com%2Fannounce&amp;tr=http%3A%2F%2Ft.acg.rip%3A6699%2Fannounce&amp;tr=http%3A%2F%2Ftr.bangumi.moe%3A6969%2Fannounce&amp;tr=http%3A%2F%2Fshare.camoe.cn%3A8080%2Fannounce&amp;tr=http%3A%2F%2Fsukebei.tracker.wf%3A8888%2Fannounce&amp;tr=http%3A%2F%2Fopenbittorrent.com%3A80%2Fannounce&amp;tr=https%3A%2F%2Fopentracker.i2p.rocks%3A443%2Fannounce&amp;tr=https%3A%2F%2Ftracker.nanoha.org%3A443%2Fannounce&amp;tr=https%3A%2F%2Ftracker.cyber-hub.net%3A443%2Fannounce&amp;tr=https%3A%2F%2Ftr.burnabyhighstar.com%3A443%2Fannounce"  length="1"  type="application/x-bittorrent" ></enclosure>
<author><![CDATA[nekomoekissaten]]></author>
<guid isPermaLink="true" >http://share.dmhy.org/topics/view/662812_10_Sousou_no_Frieren_22_1080p.html</guid>
<category domain="http://share.dmhy.org/topics/list/sort_id/2" ><![CDATA[動畫]]></category>
</item>
<item>
<title><![CDATA[【喵萌奶茶屋】★10月新番★[葬送的芙莉蓮 / Sousou no Frieren][21][1080p][繁日雙語][招募翻譯]]]></title>
<link>http://share.dmhy.org/topics/view/662260_10_Sousou_no_Frieren_21_1080p.html</link>
<pubDate>Wed, 07 Feb 2024 08:21:20 +0800</pubDate>
<description><![CDATA[<p><img src="https://s2.loli.net/2023/10/04/2YE8DWOANHUxJKf.png" width="1000px" /></p>
<hr />
<p><img src="https://nekomoe.pages.dev/images/mainVisual/char.jpg" /></p>
<hr />
<p>喵萌奶茶屋招募以下職位的小伙伴！</p>
<p>1.<strong>翻譯</strong>：沒有證書要求，能正確聽譯一集動畫即可</p>
<p>2.<strong>時軸</strong>：使用 Aegisub 準確拉軸對幀並設置合適的樣式、字體、螢幕字</p>
<p>申請請加入 QQ 群 421320480 參加考核，請正確註明應募的職位。</p>
<hr />
<p>奶茶屋所有最新的【<a href="https://github.com/Nekomoekissaten/Nekomoekissaten-Subs" target="_blank" rel="external nofollow"><strong>外掛字幕</strong></a>】在這裡，若想轉載修改見 repo 的 README。</p>]]></description>
<enclosure url="magnet:?xt=urn:btih:SAZ5J63TBVGHL7ZADNPDAQAYAQY6JBMU&amp;dn=&amp;tr=http%3A%2F%2F104.143.10.186%3A8000%2Fannounce&amp;tr=udp%3A%2F%2F104.143.10.186%3A8000%2Fannounce&amp;tr=http%3A%2F%2Ftracker.openbittorrent.com%3A80%2Fannounce&amp;tr=http%3A%2F%2Ftracker3.itzmx.com%3A6961%2Fannounce&amp;tr=http%3A%2F%2Ftracker4.itzmx.com%3A2710%2Fannounce&amp;tr=http%3A%2F%2Ftracker.publicbt.com%3A80%2Fannounce&amp;tr=http%3A%2F%2Ftracker.prq.to%2Fannounce&amp;tr=http%3A%2F%2Fopen.acgtracker.com%3A1096%2Fannounce&amp;tr=https%3A%2F%2Ft-115.rhcloud.com%2Fonly_for_ylbud&amp;tr=http%3A%2F%2Ftracker1.itzmx.com%3A8080%2Fannounce&amp;tr=http%3A%2F%2Ftracker2.itzmx.com%3A6961%2Fannounce&amp;tr=udp%3A%2F%2Ftracker1.itzmx.com%3A8080%2Fannounce&amp;tr=udp%3A%2F%2Ftracker2.itzmx.com%3A6961%2Fannounce&amp;tr=udp%3A%2F%2Ftracker3.itzmx.com%3A6961%2Fannounce&amp;tr=udp%3A%2F%2Ftracker4.itzmx.com%3A2710%2Fannounce&amp;tr=http%3A%2F%2Fnyaa.tracker.wf%3A7777%2Fannounce&amp;tr=http%3A%2F%2Ft.nyaatracker.com%2Fannounce&amp;tr=http%3A%2F%2Ft.acg.rip%3A6699%2Fannounce&amp;tr=http%3A%2F%2Ftr.bangumi.moe%3A6969%2Fannounce&amp;tr=http%3A%2F%2Fshare.camoe.cn%3A8080%2Fannounce&amp;tr=http%3A%2F%2Fsukebei.tracker.wf%3A8888%2Fannounce&amp;tr=http%3A%2F%2Fopenbittorrent.com%3A80%2Fannounce&amp;tr=https%3A%2F%2Fopentracker.i2p.rocks%3A443%2Fannounce&amp;tr=https%3A%2F%2Ftracker.nanoha.org%3A443%2Fannounce&amp;tr=https%3A%2F%2Ftracker.cyber-hub.net%3A443%2Fannounce&amp;tr=https%3A%2F%2Ftr.burnabyhighstar.com%3A443%2Fannounce"  length="1"  type="application/x-bittorrent" ></enclosure>
<author><![CDATA[nekomoekissaten]]></author>
<guid isPermaLink="true" >http://share.dmhy.org/topics/view/662260_10_Sousou_no_Frieren_21_1080p.html</guid>
<category domain="http://share.dmhy.org/topics/list/sort_id/2" ><![CDATA[動畫]]></category>
</item>
<item>
<title><![CDATA[【喵萌奶茶屋】★10月新番★[葬送的芙莉莲 / Sousou no Frieren][21][1080p][简日双语][招募翻译]]]></title>
<link>http://share.dmhy.org/topics/view/662259_10_Sousou_no_Frieren_21_1080p.html</link>
<pubDate>Wed, 07 Feb 2024 08:21:09 +0800</pubDate>
<description><![CDATA[<p><img src="https://s2.loli.net/2023/10/04/2YE8DWOANHUxJKf.png" width="1000px" /></p>
<hr />
<p><img src="https://nekomoe.pages.dev/images/mainVisual/char.jpg" /></p>
<hr />
<p>喵萌奶茶屋招募以下职位的小伙伴！</p>
<p>1.<strong>翻译</strong>：没有证书要求，能正确听译一集动画即可</p>
<p>2.<strong>时轴</strong>：使用 Aegisub 准确拉轴对帧并设置合适的样式、字体、屏幕字</p>
<p>申请请加入 QQ 群 421320480 参加考核，请正确注明应募的职位。</p>
<hr />
<p>奶茶屋所有最新的【<a href="https://github.com/Nekomoekissaten/Nekomoekissaten-Subs" target="_blank" rel="external nofollow"><strong>外挂字幕</strong></a>】在这里，若想转载修改见 repo 的 README。</p>]]></description>
<enclosure url="magnet:?xt=urn:btih:Q3T34VKYZVBQ6EF5XB4XGB2SFMWS4KP3&amp;dn=&amp;tr=http%3A%2F%2F104.143.10.186%3A8000%2Fannounce&amp;tr=udp%3A%2F%2F104.143.10.186%3A8000%2Fannounce&amp;tr=http%3A%2F%2Ftracker.openbittorrent.com%3A80%2Fannounce&amp;tr=http%3A%2F%2Ftracker3.itzmx.com%3A6961%2Fannounce&amp;tr=http%3A%2F%2Ftracker4.itzmx.com%3A2710%2Fannounce&amp;tr=http%3A%2F%2Ftracker.publicbt.com%3A80%2Fannounce&amp;tr=http%3A%2F%2Ftracker.prq.to%2Fannounce&amp;tr=http%3A%2F%2Fopen.acgtracker.com%3A1096%2Fannounce&amp;tr=https%3A%2F%2Ft-115.rhcloud.com%2Fonly_for_ylbud&amp;tr=http%3A%2F%2Ftracker1.itzmx.com%3A8080%2Fannounce&amp;tr=http%3A%2F%2Ftracker2.itzmx.com%3A6961%2Fannounce&amp;tr=udp%3A%2F%2Ftracker1.itzmx.com%3A8080%2Fannounce&amp;tr=udp%3A%2F%2Ftracker2.itzmx.com%3A6961%2Fannounce&amp;tr=udp%3A%2F%2Ftracker3.itzmx.com%3A6961%2Fannounce&amp;tr=udp%3A%2F%2Ftracker4.itzmx.com%3A2710%2Fannounce&amp;tr=http%3A%2F%2Fnyaa.tracker.wf%3A7777%2Fannounce&amp;tr=http%3A%2F%2Ft.nyaatracker.com%2Fannounce&amp;tr=http%3A%2F%2Ft.acg.rip%3A6699%2Fannounce&amp;tr=http%3A%2F%2Ftr.bangumi.moe%3A6969%2Fannounce&amp;tr=http%3A%2F%2Fshare.camoe.cn%3A8080%2Fannounce&amp;tr=http%3A%2F%2Fsukebei.tracker.wf%3A8888%2Fannounce&amp;tr=http%3A%2F%2Fopenbittorrent.com%3A80%2Fannounce&amp;tr=https%3A%2F%2Fopentracker.i2p.rocks%3A443%2Fannounce&amp;tr=https%3A%2F%2Ftracker.nanoha.org%3A443%2Fannounce&amp;tr=https%3A%2F%2Ftracker.cyber-hub.net%3A443%2Fannounce&amp;tr=https%3A%2F%2Ftr.burnabyhighstar.com%3A443%2Fannounce"  length="1"  type="application/x-bittorrent" ></enclosure>
<author><![CDATA[nekomoekissaten]]></author>
<guid isPermaLink="true" >http://share.dmhy.org/topics/view/662259_10_Sousou_no_Frieren_21_1080p.html</guid>
<category domain="http://share.dmhy.org/topics/list/sort_id/2" ><![CDATA[動畫]]></category>
</item>
<item>
<title><![CDATA[【喵萌奶茶屋】★10月新番★[葬送的芙莉蓮 / Sousou no Frieren][20][1080p][繁日雙語][招募翻譯]]]></title>
<link>http://share.dmhy.org/topics/view/661924_10_Sousou_no_Frieren_20_1080p.html</link>
<pubDate>Fri, 02 Feb 2024 19:49:15 +0800</pubDate>
<description><![CDATA[<p><img src="https://s2.loli.net/2023/10/04/2YE8DWOANHUxJKf.png" width="1000px" /></p>
<hr />
<p><img src="https://nekomoe.pages.dev/images/mainVisual/char.jpg" /></p>
<hr />
<p>喵萌奶茶屋招募以下職位的小伙伴！</p>
<p>1.<strong>翻譯</strong>：沒有證書要求，能正確聽譯一集動畫即可</p>
<p>2.<strong>時軸</strong>：使用 Aegisub 準確拉軸對幀並設置合適的樣式、字體、螢幕字</p>
<p>申請請加入 QQ 群 421320480 參加考核，請正確註明應募的職位。</p>
<hr />
<p>奶茶屋所有最新的【<a href="https://github.com/Nekomoekissaten/Nekomoekissaten-Subs" target="_blank" rel="external nofollow"><strong>外掛字幕</strong></a>】在這裡，若想轉載修改見 repo 的 README。</p>]]></description>
<enclosure url="magnet:?xt=urn:btih:MK5IL55A7SZIJZSM6HWUR2K33GIXRHOZ&amp;dn=&amp;tr=http%3A%2F%2F104.143.10.186%3A8000%2Fannounce&amp;tr=udp%3A%2F%2F104.143.10.186%3A8000%2Fannounce&amp;tr=http%3A%2F%2Ftracker.openbittorrent.com%3A80%2Fannounce&amp;tr=http%3A%2F%2Ftracker3.itzmx.com%3A6961%2Fannounce&amp;tr=http%3A%2F%2Ftracker4.itzmx.com%3A2710%2Fannounce&amp;tr=http%3A%2F%2Ftracker.publicbt.com%3A80%2Fannounce&amp;tr=http%3A%2F%2Ftracker.prq.to%2Fannounce&amp;tr=http%3A%2F%2Fopen.acgtracker.com%3A1096%2Fannounce&amp;tr=https%3A%2F%2Ft-115.rhcloud.com%2Fonly_for_ylbud&amp;tr=http%3A%2F%2Ftracker1.itzmx.com%3A8080%2Fannounce&amp;tr=http%3A%2F%2Ftracker2.itzmx.com%3A6961%2Fannounce&amp;tr=udp%3A%2F%2Ftracker1.itzmx.com%3A8080%2Fannounce&amp;tr=udp%3A%2F%2Ftracker2.itzmx.com%3A6961%2Fannounce&amp;tr=udp%3A%2F%2Ftracker3.itzmx.com%3A6961%2Fannounce&amp;tr=udp%3A%2F%2Ftracker4.itzmx.com%3A2710%2Fannounce&amp;tr=http%3A%2F%2Fnyaa.tracker.wf%3A7777%2Fannounce&amp;tr=http%3A%2F%2Ft.nyaatracker.com%2Fannounce&amp;tr=http%3A%2F%2Ft.acg.rip%3A6699%2Fannounce&amp;tr=http%3A%2F%2Ftr.bangumi.moe%3A6969%2Fannounce&amp;tr=http%3A%2F%2Fshare.camoe.cn%3A8080%2Fannounce&amp;tr=http%3A%2F%2Fsukebei.tracker.wf%3A8888%2Fannounce&amp;tr=http%3A%2F%2Fopenbittorrent.com%3A80%2Fannounce&amp;tr=https%3A%2F%2Fopentracker.i2p.rocks%3A443%2Fannounce&amp;tr=https%3A%2F%2Ftracker.nanoha.org%3A443%2Fannounce&amp;tr=https%3A%2F%2Ftracker.cyber-hub.net%3A443%2Fannounce&amp;tr=https%3A%2F%2Ftr.burnabyhighstar.com%3A443%2Fannounce"  length="1"  type="application/x-bittorrent" ></enclosure>
<author><![CDATA[nekomoekissaten]]></author>
<guid isPermaLink="true" >http://share.dmhy.org/topics/view/661924_10_Sousou_no_Frieren_20_1080p.html</guid>
<category domain="http://share.dmhy.org/topics/list/sort_id/2" ><![CDATA[動畫]]></category>
</item>
<item>
<title><![CDATA[【喵萌奶茶屋】★10月新番★[葬送的芙莉莲 / Sousou no Frieren][20][1080p][简日双语][招募翻译]]]></title>
<link>http://share.dmhy.org/topics/view/661923_10_Sousou_no_Frieren_20_1080p.html</link>
<pubDate>Fri, 02 Feb 2024 19:48:59 +0800</pubDate>
<description><![CDATA[<p><img src="https://s2.loli.net/2023/10/04/2YE8DWOANHUxJKf.png" width="1000px" /></p>
<hr />
<p><img src="https://nekomoe.pages.dev/images/mainVisual/char.jpg" /></p>
<hr />
<p>喵萌奶茶屋招募以下职位的小伙伴！</p>
<p>1.<strong>翻译</strong>：没有证书要求，能正确听译一集动画即可</p>
<p>2.<strong>时轴</strong>：使用 Aegisub 准确拉轴对帧并设置合适的样式、字体、屏幕字</p>
<p>申请请加入 QQ 群 421320480 参加考核，请正确注明应募的职位。</p>
<hr />
<p>奶茶屋所有最新的【<a href="https://github.com/Nekomoekissaten/Nekomoekissaten-Subs" target="_blank" rel="external nofollow"><strong>外挂字幕</strong></a>】在这里，若想转载修改见 repo 的 README。</p>]]></description>
<enclosure url="magnet:?xt=urn:btih:57NJFP6XIE2CN56NAK6PZLV5JQQ432XA&amp;dn=&amp;tr=http%3A%2F%2F104.143.10.186%3A8000%2Fannounce&amp;tr=udp%3A%2F%2F104.143.10.186%3A8000%2Fannounce&amp;tr=http%3A%2F%2Ftracker.openbittorrent.com%3A80%2Fannounce&amp;tr=http%3A%2F%2Ftracker3.itzmx.com%3A6961%2Fannounce&amp;tr=http%3A%2F%2Ftracker4.itzmx.com%3A2710%2Fannounce&amp;tr=http%3A%2F%2Ftracker.publicbt.com%3A80%2Fannounce&amp;tr=http%3A%2F%2Ftracker.prq.to%2Fannounce&amp;tr=http%3A%2F%2Fopen.acgtracker.com%3A1096%2Fannounce&amp;tr=https%3A%2F%2Ft-115.rhcloud.com%2Fonly_for_ylbud&amp;tr=http%3A%2F%2Ftracker1.itzmx.com%3A8080%2Fannounce&amp;tr=http%3A%2F%2Ftracker2.itzmx.com%3A6961%2Fannounce&amp;tr=udp%3A%2F%2Ftracker1.itzmx.com%3A8080%2Fannounce&amp;tr=udp%3A%2F%2Ftracker2.itzmx.com%3A6961%2Fannounce&amp;tr=udp%3A%2F%2Ftracker3.itzmx.com%3A6961%2Fannounce&amp;tr=udp%3A%2F%2Ftracker4.itzmx.com%3A2710%2Fannounce&amp;tr=http%3A%2F%2Fnyaa.tracker.wf%3A7777%2Fannounce&amp;tr=http%3A%2F%2Ft.nyaatracker.com%2Fannounce&amp;tr=http%3A%2F%2Ft.acg.rip%3A6699%2Fannounce&amp;tr=http%3A%2F%2Ftr.bangumi.moe%3A6969%2Fannounce&amp;tr=http%3A%2F%2Fshare.camoe.cn%3A8080%2Fannounce&amp;tr=http%3A%2F%2Fsukebei.tracker.wf%3A8888%2Fannounce&amp;tr=http%3A%2F%2Fopenbittorrent.com%3A80%2Fannounce&amp;tr=https%3A%2F%2Fopentracker.i2p.rocks%3A443%2Fannounce&amp;tr=https%3A%2F%2Ftracker.nanoha.org%3A443%2Fannounce&amp;tr=https%3A%2F%2Ftracker.cyber-hub.net%3A443%2Fannounce&amp;tr=https%3A%2F%2Ftr.burnabyhighstar.com%3A443%2Fannounce"  length="1"  type="application/x-bittorrent" ></enclosure>
<author><![CDATA[nekomoekissaten]]></author>
<guid isPermaLink="true" >http://share.dmhy.org/topics/view/661923_10_Sousou_no_Frieren_20_1080p.html</guid>
<category domain="http://share.dmhy.org/topics/list/sort_id/2" ><![CDATA[動畫]]></category>
</item>
<item>
<title><![CDATA[【喵萌奶茶屋】★10月新番★[葬送的芙莉蓮 / Sousou no Frieren][19][1080p][繁日雙語][招募翻譯]]]></title>
<link>http://share.dmhy.org/topics/view/661390_10_Sousou_no_Frieren_19_1080p.html</link>
<pubDate>Thu, 25 Jan 2024 07:07:01 +0800</pubDate>
<description><![CDATA[<p><img src="https://s2.loli.net/2023/10/04/2YE8DWOANHUxJKf.png" width="1000px" /></p>
<hr />
<p><img src="https://nekomoe.pages.dev/images/mainVisual/char.jpg" /></p>
<hr />
<p>喵萌奶茶屋招募以下職位的小伙伴！</p>
<p>1.<strong>翻譯</strong>：沒有證書要求，能正確聽譯一集動畫即可</p>
<p>2.<strong>時軸</strong>：使用 Aegisub 準確拉軸對幀並設置合適的樣式、字體、螢幕字</p>
<p>申請請加入 QQ 群 421320480 參加考核，請正確註明應募的職位。</p>
<hr />
<p>奶茶屋所有最新的【<a href="https://github.com/Nekomoekissaten/Nekomoekissaten-Subs" target="_blank" rel="external nofollow"><strong>外掛字幕</strong></a>】在這裡，若想轉載修改見 repo 的 README。</p>]]></description>
<enclosure url="magnet:?xt=urn:btih:OW6IM27Z2LJD2L5TLKOBYHQ3WIATVOY2&amp;dn=&amp;tr=http%3A%2F%2F104.143.10.186%3A8000%2Fannounce&amp;tr=udp%3A%2F%2F104.143.10.186%3A8000%2Fannounce&amp;tr=http%3A%2F%2Ftracker.openbittorrent.com%3A80%2Fannounce&amp;tr=http%3A%2F%2Ftracker3.itzmx.com%3A6961%2Fannounce&amp;tr=http%3A%2F%2Ftracker4.itzmx.com%3A2710%2Fannounce&amp;tr=http%3A%2F%2Ftracker.publicbt.com%3A80%2Fannounce&amp;tr=http%3A%2F%2Ftracker.prq.to%2Fannounce&amp;tr=http%3A%2F%2Fopen.acgtracker.com%3A1096%2Fannounce&amp;tr=https%3A%2F%2Ft-115.rhcloud.com%2Fonly_for_ylbud&amp;tr=http%3A%2F%2Ftracker1.itzmx.com%3A8080%2Fannounce&amp;tr=http%3A%2F%2Ftracker2.itzmx.com%3A6961%2Fannounce&amp;tr=udp%3A%2F%2Ftracker1.itzmx.com%3A8080%2Fannounce&amp;tr=udp%3A%2F%2Ftracker2.itzmx.com%3A6961%2Fannounce&amp;tr=udp%3A%2F%2Ftracker3.itzmx.com%3A6961%2Fannounce&amp;tr=udp%3A%2F%2Ftracker4.itzmx.com%3A2710%2Fannounce&amp;tr=http%3A%2F%2Fnyaa.tracker.wf%3A7777%2Fannounce&amp;tr=http%3A%2F%2Ft.nyaatracker.com%2Fannounce&amp;tr=http%3A%2F%2Ft.acg.rip%3A6699%2Fannounce&amp;tr=http%3A%2F%2Ftr.bangumi.moe%3A6969%2Fannounce&amp;tr=http%3A%2F%2Fshare.camoe.cn%3A8080%2Fannounce&amp;tr=http%3A%2F%2Fsukebei.tracker.wf%3A8888%2Fannounce&amp;tr=http%3A%2F%2Fopenbittorrent.com%3A80%2Fannounce&amp;tr=https%3A%2F%2Fopentracker.i2p.rocks%3A443%2Fannounce&amp;tr=https%3A%2F%2Ftracker.nanoha.org%3A443%2Fannounce&amp;tr=https%3A%2F%2Ftracker.cyber-hub.net%3A443%2Fannounce&amp;tr=https%3A%2F%2Ftr.burnabyhighstar.com%3A443%2Fannounce"  length="1"  type="application/x-bittorrent" ></enclosure>
<author><![CDATA[nekomoekissaten]]></author>
<guid isPermaLink="true" >http://share.dmhy.org/topics/view/661390_10_Sousou_no_Frieren_19_1080p.html</guid>
<category domain="http://share.dmhy.org/topics/list/sort_id/2" ><![CDATA[動畫]]></category>
</item>
<item>
<title><![CDATA[【喵萌奶茶屋】★10月新番★[葬送的芙莉莲 / Sousou no Frieren][19][1080p][简日双语][招募翻译]]]></title>
<link>http://share.dmhy.org/topics/view/661389_10_Sousou_no_Frieren_19_1080p.html</link>
<pubDate>Thu, 25 Jan 2024 07:06:51 +0800</pubDate>
<description><![CDATA[<p><img src="https://s2.loli.net/2023/10/04/2YE8DWOANHUxJKf.png" width="1000px" /></p>
<hr />
<p><img src="https://nekomoe.pages.dev/images/mainVisual/char.jpg" /></p>
<hr />
<p>喵萌奶茶屋招募以下职位的小伙伴！</p>
<p>1.<strong>翻译</strong>：没有证书要求，能正确听译一集动画即可</p>
<p>2.<strong>时轴</strong>：使用 Aegisub 准确拉轴对帧并设置合适的样式、字体、屏幕字</p>
<p>申请请加入 QQ 群 421320480 参加考核，请正确注明应募的职位。</p>
<hr />
<p>奶茶屋所有最新的【<a href="https://github.com/Nekomoekissaten/Nekomoekissaten-Subs" target="_blank" rel="external nofollow"><strong>外挂字幕</strong></a>】在这里，若想转载修改见 repo 的 README。</p>]]></description>
<enclosure url="magnet:?xt=urn:btih:X2XWUFUFP5ML5Y56N5G3EGFT2OC2K3HG&amp;dn=&amp;tr=http%3A%2F%2F104.143.10.186%3A8000%2Fannounce&amp;tr=udp%3A%2F%2F104.143.10.186%3A8000%2Fannounce&amp;tr=http%3A%2F%2Ftracker.openbittorrent.com%3A80%2Fannounce&amp;tr=http%3A%2F%2Ftracker3.itzmx.com%3A6961%2Fannounce&amp;tr=http%3A%2F%2Ftracker4.itzmx.com%3A2710%2Fannounce&amp;tr=http%3A%2F%2Ftracker.publicbt.com%3A80%2Fannounce&amp;tr=http%3A%2F%2Ftracker.prq.to%2Fannounce&amp;tr=http%3A%2F%2Fopen.acgtracker.com%3A1096%2Fannounce&amp;tr=https%3A%2F%2Ft-115.rhcloud.com%2Fonly_for_ylbud&amp;tr=http%3A%2F%2Ftracker1.itzmx.com%3A8080%2Fannounce&amp;tr=http%3A%2F%2Ftracker2.itzmx.com%3A6961%2Fannounce&amp;tr=udp%3A%2F%2Ftracker1.itzmx.com%3A8080%2Fannounce&amp;tr=udp%3A%2F%2Ftracker2.itzmx.com%3A6961%2Fannounce&amp;tr=udp%3A%2F%2Ftracker3.itzmx.com%3A6961%2Fannounce&amp;tr=udp%3A%2F%2Ftracker4.itzmx.com%3A2710%2Fannounce&amp;tr=http%3A%2F%2Fnyaa.tracker.wf%3A7777%2Fannounce&amp;tr=http%3A%2F%2Ft.nyaatracker.com%2Fannounce&amp;tr=http%3A%2F%2Ft.acg.rip%3A6699%2Fannounce&amp;tr=http%3A%2F%2Ftr.bangumi.moe%3A6969%2Fannounce&amp;tr=http%3A%2F%2Fshare.camoe.cn%3A8080%2Fannounce&amp;tr=http%3A%2F%2Fsukebei.tracker.wf%3A8888%2Fannounce&amp;tr=http%3A%2F%2Fopenbittorrent.com%3A80%2Fannounce&amp;tr=https%3A%2F%2Fopentracker.i2p.rocks%3A443%2Fannounce&amp;tr=https%3A%2F%2Ftracker.nanoha.org%3A443%2Fannounce&amp;tr=https%3A%2F%2Ftracker.cyber-hub.net%3A443%2Fannounce&amp;tr=https%3A%2F%2Ftr.burnabyhighstar.com%3A443%2Fannounce"  length="1"  type="application/x-bittorrent" ></enclosure>
<author><![CDATA[nekomoekissaten]]></author>
<guid isPermaLink="true" >http://share.dmhy.org/topics/view/661389_10_Sousou_no_Frieren_19_1080p.html</guid>
<category domain="http://share.dmhy.org/topics/list/sort_id/2" ><![CDATA[動畫]]></category>
</item>
<item>
<title><![CDATA[【喵萌奶茶屋】★10月新番★[葬送的芙莉蓮 / Sousou no Frieren][18][1080p][繁日雙語][招募翻譯]]]></title>
<link>http://share.dmhy.org/topics/view/660783_10_Sousou_no_Frieren_18_1080p.html</link>
<pubDate>Thu, 18 Jan 2024 05:57:46 +0800</pubDate>
<description><![CDATA[<p><img src="https://s2.loli.net/2023/10/04/2YE8DWOANHUxJKf.png" width="1000px" /></p>
<hr />
<p><img src="https://nekomoe.pages.dev/images/mainVisual/char.jpg" /></p>
<hr />
<p>喵萌奶茶屋招募以下職位的小伙伴！</p>
<p>1.<strong>翻譯</strong>：沒有證書要求，能正確聽譯一集動畫即可</p>
<p>2.<strong>時軸</strong>：使用 Aegisub 準確拉軸對幀並設置合適的樣式、字體、螢幕字</p>
<p>3.<strong>後期</strong>：懂時軸基礎知識並使用 Vapoursynth 或 Avisynth 內嵌字幕，做種發布分流</p>
<p>4.<strong>壓制</strong>：能獨立寫程式碼最佳化畫質並使用 VapourSynth 或 AviSynth 壓製 BDRip / DVDRip</p>
<p>5.<strong>特效</strong>：熟練應用特效代碼製作合適的歌詞特效</p>
<p>6.<strong>畫師</strong>：畫海報、字幕娘、表情包、LOGO 等</p>
<p>7.<strong>分流</strong>：捐獻伺服器盒子永久保種本組合集資源</p>
<p>歡迎熱愛二次元熱衷字幕製作的小伙伴加入！申請請加入 QQ 群：421320480</p>
<p>粉絲群：477659567</p>
<hr />
<p>奶茶屋所有最新的【<a href="https://github.com/Nekomoekissaten/Nekomoekissaten-Subs" target="_blank" rel="external nofollow"><strong>外掛字幕</strong></a>】在這裡，如果有對本組做過的番有興趣的，歡迎來調 BD 軸！</p>
<p>本組發布的資源請以最新發布為準，最新的 TV 合集，最新的 BDRip 合集是最新修正的資源！</p>
<p>本組發布的外掛字幕請勿隨意修改後發布至公網！</p>
<p>點擊加入【<a href="https://jq.qq.com/?_wv=1027&amp;k=4ERTkKi" target="_blank" rel="external nofollow"><strong>奶茶分流小分隊</strong></a>】，為自己喜愛的番奉獻一份力量！</p>
<hr />
<p>從 2020 年 10 月新番起，本組發布的作品將去掉 Web 片源自帶的片頭！</p>]]></description>
<enclosure url="magnet:?xt=urn:btih:U4XDC3JQO2VPZ5QPI3J2JXQ755ZU2PSS&amp;dn=&amp;tr=http%3A%2F%2F104.143.10.186%3A8000%2Fannounce&amp;tr=udp%3A%2F%2F104.143.10.186%3A8000%2Fannounce&amp;tr=http%3A%2F%2Ftracker.openbittorrent.com%3A80%2Fannounce&amp;tr=http%3A%2F%2Ftracker3.itzmx.com%3A6961%2Fannounce&amp;tr=http%3A%2F%2Ftracker4.itzmx.com%3A2710%2Fannounce&amp;tr=http%3A%2F%2Ftracker.publicbt.com%3A80%2Fannounce&amp;tr=http%3A%2F%2Ftracker.prq.to%2Fannounce&amp;tr=http%3A%2F%2Fopen.acgtracker.com%3A1096%2Fannounce&amp;tr=https%3A%2F%2Ft-115.rhcloud.com%2Fonly_for_ylbud&amp;tr=http%3A%2F%2Ftracker1.itzmx.com%3A8080%2Fannounce&amp;tr=http%3A%2F%2Ftracker2.itzmx.com%3A6961%2Fannounce&amp;tr=udp%3A%2F%2Ftracker1.itzmx.com%3A8080%2Fannounce&amp;tr=udp%3A%2F%2Ftracker2.itzmx.com%3A6961%2Fannounce&amp;tr=udp%3A%2F%2Ftracker3.itzmx.com%3A6961%2Fannounce&amp;tr=udp%3A%2F%2Ftracker4.itzmx.com%3A2710%2Fannounce&amp;tr=http%3A%2F%2Fnyaa.tracker.wf%3A7777%2Fannounce&amp;tr=http%3A%2F%2Ft.nyaatracker.com%2Fannounce&amp;tr=http%3A%2F%2Ft.acg.rip%3A6699%2Fannounce&amp;tr=http%3A%2F%2Ftr.bangumi.moe%3A6969%2Fannounce&amp;tr=http%3A%2F%2Fshare.camoe.cn%3A8080%2Fannounce&amp;tr=http%3A%2F%2Fsukebei.tracker.wf%3A8888%2Fannounce&amp;tr=http%3A%2F%2Fopenbittorrent.com%3A80%2Fannounce&amp;tr=https%3A%2F%2Fopentracker.i2p.rocks%3A443%2Fannounce&amp;tr=https%3A%2F%2Ftracker.nanoha.org%3A443%2Fannounce&amp;tr=https%3A%2F%2Ftracker.cyber-hub.net%3A443%2Fannounce&amp;tr=https%3A%2F%2Ftr.burnabyhighstar.com%3A443%2Fannounce"  length="1"  type="application/x-bittorrent" ></enclosure>
<author><![CDATA[nekomoekissaten]]></author>
<guid isPermaLink="true" >http://share.dmhy.org/topics/view/660783_10_Sousou_no_Frieren_18_1080p.html</guid>
<category domain="http://share.dmhy.org/topics/list/sort_id/2" ><![CDATA[動畫]]></category>
</item>
<item>
<title><![CDATA[【喵萌奶茶屋】★10月新番★[葬送的芙莉莲 / Sousou no Frieren][18][1080p][简日双语][招募翻译]]]></title>
<link>http://share.dmhy.org/topics/view/660782_10_Sousou_no_Frieren_18_1080p.html</link>
<pubDate>Thu, 18 Jan 2024 05:57:37 +0800</pubDate>
<description><![CDATA[<p><img src="https://s2.loli.net/2023/10/04/2YE8DWOANHUxJKf.png" width="1000px" /></p>
<hr />
<p><img src="https://nekomoe.pages.dev/images/mainVisual/char.jpg" /></p>
<hr />
<p>喵萌奶茶屋招募以下职位的小伙伴！</p>
<p>1.<strong>翻译</strong>：没有证书要求，能正确听译一集动画即可</p>
<p>2.<strong>时轴</strong>：使用 Aegisub 准确拉轴对帧并设置合适的样式、字体、屏幕字</p>
<p>3.<strong>后期</strong>：懂时轴基础知识并使用 Vapoursynth 或 Avisynth 内嵌字幕，做种发布分流</p>
<p>4.<strong>压制</strong>：能独立写代码优化画质并使用 VapourSynth 或 AviSynth 压制 BDRip / DVDRip</p>
<p>5.<strong>特效</strong>：熟练应用特效代码制作合适的歌词特效</p>
<p>6.<strong>画师</strong>：画海报、字幕娘、表情包、LOGO 等</p>
<p>7.<strong>分流</strong>：捐献服务器盒子永久保种本组合集资源</p>
<p>欢迎热爱二次元热衷字幕制作的小伙伴加入！申请请加入 QQ 群：421320480</p>
<p>粉丝群：477659567</p>
<hr />
<p>奶茶屋所有最新的【<a href="https://github.com/Nekomoekissaten/Nekomoekissaten-Subs" target="_blank" rel="external nofollow"><strong>外挂字幕</strong></a>】在这里，如果有对本组做过的番有兴趣的，欢迎来调 BD 轴！</p>
<p>本组发布的资源请以最新发布为准，最新的 TV 合集，最新的 BDRip 合集是最新修正的资源！</p>
<p>本组发布的外挂字幕请勿随意修改后发布至公网！</p>
<p>点击加入【<a href="https://jq.qq.com/?_wv=1027&amp;k=4ERTkKi" target="_blank" rel="external nofollow"><strong>奶茶分流小分队</strong></a>】，为自己喜爱的番奉献一份力量！</p>
<hr />
<p>从 2020 年 10 月新番起，本组发布的作品将去掉 Web 片源自带的片头！</p>]]></description>
<enclosure url="magnet:?xt=urn:btih:65QD3SS4NVVVATN7NS2BI67PRSBXMZW4&amp;dn=&amp;tr=http%3A%2F%2F104.143.10.186%3A8000%2Fannounce&amp;tr=udp%3A%2F%2F104.143.10.186%3A8000%2Fannounce&amp;tr=http%3A%2F%2Ftracker.openbittorrent.com%3A80%2Fannounce&amp;tr=http%3A%2F%2Ftracker3.itzmx.com%3A6961%2Fannounce&amp;tr=http%3A%2F%2Ftracker4.itzmx.com%3A2710%2Fannounce&amp;tr=http%3A%2F%2Ftracker.publicbt.com%3A80%2Fannounce&amp;tr=http%3A%2F%2Ftracker.prq.to%2Fannounce&amp;tr=http%3A%2F%2Fopen.acgtracker.com%3A1096%2Fannounce&amp;tr=https%3A%2F%2Ft-115.rhcloud.com%2Fonly_for_ylbud&amp;tr=http%3A%2F%2Ftracker1.itzmx.com%3A8080%2Fannounce&amp;tr=http%3A%2F%2Ftracker2.itzmx.com%3A6961%2Fannounce&amp;tr=udp%3A%2F%2Ftracker1.itzmx.com%3A8080%2Fannounce&amp;tr=udp%3A%2F%2Ftracker2.itzmx.com%3A6961%2Fannounce&amp;tr=udp%3A%2F%2Ftracker3.itzmx.com%3A6961%2Fannounce&amp;tr=udp%3A%2F%2Ftracker4.itzmx.com%3A2710%2Fannounce&amp;tr=http%3A%2F%2Fnyaa.tracker.wf%3A7777%2Fannounce&amp;tr=http%3A%2F%2Ft.nyaatracker.com%2Fannounce&amp;tr=http%3A%2F%2Ft.acg.rip%3A6699%2Fannounce&amp;tr=http%3A%2F%2Ftr.bangumi.moe%3A6969%2Fannounce&amp;tr=http%3A%2F%2Fshare.camoe.cn%3A8080%2Fannounce&amp;tr=http%3A%2F%2Fsukebei.tracker.wf%3A8888%2Fannounce&amp;tr=http%3A%2F%2Fopenbittorrent.com%3A80%2Fannounce&amp;tr=https%3A%2F%2Fopentracker.i2p.rocks%3A443%2Fannounce&amp;tr=https%3A%2F%2Ftracker.nanoha.org%3A443%2Fannounce&amp;tr=https%3A%2F%2Ftracker.cyber-hub.net%3A443%2Fannounce&amp;tr=https%3A%2F%2Ftr.burnabyhighstar.com%3A443%2Fannounce"  length="1"  type="application/x-bittorrent" ></enclosure>
<author><![CDATA[nekomoekissaten]]></author>
<guid isPermaLink="true" >http://share.dmhy.org/topics/view/660782_10_Sousou_no_Frieren_18_1080p.html</guid>
<category domain="http://share.dmhy.org/topics/list/sort_id/2" ><![CDATA[動畫]]></category>
</item>
<item>
<title><![CDATA[【喵萌奶茶屋】★10月新番★[葬送的芙莉蓮 / Sousou no Frieren][17][1080p][繁日雙語][招募翻譯]]]></title>
<link>http://share.dmhy.org/topics/view/660251_10_Sousou_no_Frieren_17_1080p.html</link>
<pubDate>Thu, 11 Jan 2024 06:02:40 +0800</pubDate>
<description><![CDATA[<p><img src="https://s2.loli.net/2023/10/04/2YE8DWOANHUxJKf.png" /></p>
<hr />
<p><img src="https://nekomoe.pages.dev/images/mainVisual/char.jpg" /></p>
<hr />
<p>喵萌奶茶屋招募以下職位的小伙伴！</p>
<p>1.<strong>翻譯</strong>：沒有證書要求，能正確聽譯一集動畫即可</p>
<p>2.<strong>時軸</strong>：使用 Aegisub 準確拉軸對幀並設置合適的樣式、字體、螢幕字</p>
<p>3.<strong>後期</strong>：懂時軸基礎知識並使用 Vapoursynth 或 Avisynth 內嵌字幕，做種發布分流</p>
<p>4.<strong>壓制</strong>：能獨立寫程式碼最佳化畫質並使用 VapourSynth 或 AviSynth 壓製 BDRip / DVDRip</p>
<p>5.<strong>特效</strong>：熟練應用特效代碼製作合適的歌詞特效</p>
<p>6.<strong>畫師</strong>：畫海報、字幕娘、表情包、LOGO 等</p>
<p>7.<strong>分流</strong>：捐獻伺服器盒子永久保種本組合集資源</p>
<p>歡迎熱愛二次元熱衷字幕製作的小伙伴加入！申請請加入 QQ 群：421320480</p>
<p>粉絲群：477659567</p>
<hr />
<p>奶茶屋所有最新的【<a href="https://github.com/Nekomoekissaten/Nekomoekissaten-Subs" target="_blank" rel="external nofollow"><strong>外掛字幕</strong></a>】在這裡，如果有對本組做過的番有興趣的，歡迎來調 BD 軸！</p>
<p>本組發布的資源請以最新發布為準，最新的 TV 合集，最新的 BDRip 合集是最新修正的資源！</p>
<p>本組發布的外掛字幕請勿隨意修改後發布至公網！</p>
<p>點擊加入【<a href="https://jq.qq.com/?_wv=1027&amp;k=4ERTkKi" target="_blank" rel="external nofollow"><strong>奶茶分流小分隊</strong></a>】，為自己喜愛的番奉獻一份力量！</p>
<hr />
<p>從 2020 年 10 月新番起，本組發布的作品將去掉 Web 片源自帶的片頭！</p>]]></description>
<enclosure url="magnet:?xt=urn:btih:JUJLGQQVBBNM5O6NAIIWF7YSVWA3SINH&amp;dn=&amp;tr=http%3A%2F%2F104.143.10.186%3A8000%2Fannounce&amp;tr=udp%3A%2F%2F104.143.10.186%3A8000%2Fannounce&amp;tr=http%3A%2F%2Ftracker.openbittorrent.com%3A80%2Fannounce&amp;tr=http%3A%2F%2Ftracker3.itzmx.com%3A6961%2Fannounce&amp;tr=http%3A%2F%2Ftracker4.itzmx.com%3A2710%2Fannounce&amp;tr=http%3A%2F%2Ftracker.publicbt.com%3A80%2Fannounce&amp;tr=http%3A%2F%2Ftracker.prq.to%2Fannounce&amp;tr=http%3A%2F%2Fopen.acgtracker.com%3A1096%2Fannounce&amp;tr=https%3A%2F%2Ft-115.rhcloud.com%2Fonly_for_ylbud&amp;tr=http%3A%2F%2Ftracker1.itzmx.com%3A8080%2Fannounce&amp;tr=http%3A%2F%2Ftracker2.itzmx.com%3A6961%2Fannounce&amp;tr=udp%3A%2F%2Ftracker1.itzmx.com%3A8080%2Fannounce&amp;tr=udp%3A%2F%2Ftracker2.itzmx.com%3A6961%2Fannounce&amp;tr=udp%3A%2F%2Ftracker3.itzmx.com%3A6961%2Fannounce&amp;tr=udp%3A%2F%2Ftracker4.itzmx.com%3A2710%2Fannounce&amp;tr=http%3A%2F%2Fnyaa.tracker.wf%3A7777%2Fannounce&amp;tr=http%3A%2F%2Ft.nyaatracker.com%2Fannounce&amp;tr=http%3A%2F%2Ft.acg.rip%3A6699%2Fannounce&amp;tr=http%3A%2F%2Ftr.bangumi.moe%3A6969%2Fannounce&amp;tr=http%3A%2F%2Fshare.camoe.cn%3A8080%2Fannounce&amp;tr=http%3A%2F%2Fsukebei.tracker.wf%3A8888%2Fannounce&amp;tr=http%3A%2F%2Fopenbittorrent.com%3A80%2Fannounce&amp;tr=https%3A%2F%2Fopentracker.i2p.rocks%3A443%2Fannounce&amp;tr=https%3A%2F%2Ftracker.nanoha.org%3A443%2Fannounce&amp;tr=https%3A%2F%2Ftracker.cyber-hub.net%3A443%2Fannounce&amp;tr=https%3A%2F%2Ftr.burnabyhighstar.com%3A443%2Fannounce"  length="1"  type="application/x-bittorrent" ></enclosure>
<author><![CDATA[nekomoekissaten]]></author>
<guid isPermaLink="true" >http://share.dmhy.org/topics/view/660251_10_Sousou_no_Frieren_17_1080p.html</guid>
<category domain="http://share.dmhy.org/topics/list/sort_id/2" ><![CDATA[動畫]]></category>
</item>
<item>
<title><![CDATA[【喵萌奶茶屋】★10月新番★[葬送的芙莉莲 / Sousou no Frieren][17][1080p][简日双语][招募翻译]]]></title>
<link>http://share.dmhy.org/topics/view/660250_10_Sousou_no_Frieren_17_1080p.html</link>
<pubDate>Thu, 11 Jan 2024 06:02:29 +0800</pubDate>
<description><![CDATA[<p><img src="https://s2.loli.net/2023/10/04/2YE8DWOANHUxJKf.png" /></p>
<hr />
<p><img src="https://nekomoe.pages.dev/images/mainVisual/char.jpg" /></p>
<hr />
<p>喵萌奶茶屋招募以下职位的小伙伴！</p>
<p>1.<strong>翻译</strong>：没有证书要求，能正确听译一集动画即可</p>
<p>2.<strong>时轴</strong>：使用 Aegisub 准确拉轴对帧并设置合适的样式、字体、屏幕字</p>
<p>3.<strong>后期</strong>：懂时轴基础知识并使用 Vapoursynth 或 Avisynth 内嵌字幕，做种发布分流</p>
<p>4.<strong>压制</strong>：能独立写代码优化画质并使用 VapourSynth 或 AviSynth 压制 BDRip / DVDRip</p>
<p>5.<strong>特效</strong>：熟练应用特效代码制作合适的歌词特效</p>
<p>6.<strong>画师</strong>：画海报、字幕娘、表情包、LOGO 等</p>
<p>7.<strong>分流</strong>：捐献服务器盒子永久保种本组合集资源</p>
<p>欢迎热爱二次元热衷字幕制作的小伙伴加入！申请请加入 QQ 群：421320480</p>
<p>粉丝群：477659567</p>
<hr />
<p>奶茶屋所有最新的【<a href="https://github.com/Nekomoekissaten/Nekomoekissaten-Subs" target="_blank" rel="external nofollow"><strong>外挂字幕</strong></a>】在这里，如果有对本组做过的番有兴趣的，欢迎来调 BD 轴！</p>
<p>本组发布的资源请以最新发布为准，最新的 TV 合集，最新的 BDRip 合集是最新修正的资源！</p>
<p>本组发布的外挂字幕请勿随意修改后发布至公网！</p>
<p>点击加入【<a href="https://jq.qq.com/?_wv=1027&amp;k=4ERTkKi" target="_blank" rel="external nofollow"><strong>奶茶分流小分队</strong></a>】，为自己喜爱的番奉献一份力量！</p>
<hr />
<p>从 2020 年 10 月新番起，本组发布的作品将去掉 Web 片源自带的片头！</p>]]></description>
<enclosure url="magnet:?xt=urn:btih:ZW6PSRPCIOAXZPO4GDLNMV6T6CLI2CG6&amp;dn=&amp;tr=http%3A%2F%2F104.143.10.186%3A8000%2Fannounce&amp;tr=udp%3A%2F%2F104.143.10.186%3A8000%2Fannounce&amp;tr=http%3A%2F%2Ftracker.openbittorrent.com%3A80%2Fannounce&amp;tr=http%3A%2F%2Ftracker3.itzmx.com%3A6961%2Fannounce&amp;tr=http%3A%2F%2Ftracker4.itzmx.com%3A2710%2Fannounce&amp;tr=http%3A%2F%2Ftracker.publicbt.com%3A80%2Fannounce&amp;tr=http%3A%2F%2Ftracker.prq.to%2Fannounce&amp;tr=http%3A%2F%2Fopen.acgtracker.com%3A1096%2Fannounce&amp;tr=https%3A%2F%2Ft-115.rhcloud.com%2Fonly_for_ylbud&amp;tr=http%3A%2F%2Ftracker1.itzmx.com%3A8080%2Fannounce&amp;tr=http%3A%2F%2Ftracker2.itzmx.com%3A6961%2Fannounce&amp;tr=udp%3A%2F%2Ftracker1.itzmx.com%3A8080%2Fannounce&amp;tr=udp%3A%2F%2Ftracker2.itzmx.com%3A6961%2Fannounce&amp;tr=udp%3A%2F%2Ftracker3.itzmx.com%3A6961%2Fannounce&amp;tr=udp%3A%2F%2Ftracker4.itzmx.com%3A2710%2Fannounce&amp;tr=http%3A%2F%2Fnyaa.tracker.wf%3A7777%2Fannounce&amp;tr=http%3A%2F%2Ft.nyaatracker.com%2Fannounce&amp;tr=http%3A%2F%2Ft.acg.rip%3A6699%2Fannounce&amp;tr=http%3A%2F%2Ftr.bangumi.moe%3A6969%2Fannounce&amp;tr=http%3A%2F%2Fshare.camoe.cn%3A8080%2Fannounce&amp;tr=http%3A%2F%2Fsukebei.tracker.wf%3A8888%2Fannounce&amp;tr=http%3A%2F%2Fopenbittorrent.com%3A80%2Fannounce&amp;tr=https%3A%2F%2Fopentracker.i2p.rocks%3A443%2Fannounce&amp;tr=https%3A%2F%2Ftracker.nanoha.org%3A443%2Fannounce&amp;tr=https%3A%2F%2Ftracker.cyber-hub.net%3A443%2Fannounce&amp;tr=https%3A%2F%2Ftr.burnabyhighstar.com%3A443%2Fannounce"  length="1"  type="application/x-bittorrent" ></enclosure>
<author><![CDATA[nekomoekissaten]]></author>
<guid isPermaLink="true" >http://share.dmhy.org/topics/view/660250_10_Sousou_no_Frieren_17_1080p.html</guid>
<category domain="http://share.dmhy.org/topics/list/sort_id/2" ><![CDATA[動畫]]></category>
</item>
<item>
<title><![CDATA[【喵萌奶茶屋】★10月新番★[葬送的芙莉蓮 / Sousou no Frieren][16][1080p][繁日雙語][招募翻譯]]]></title>
<link>http://share.dmhy.org/topics/view/659909_10_Sousou_no_Frieren_16_1080p.html</link>
<pubDate>Fri, 05 Jan 2024 21:54:36 +0800</pubDate>
<description><![CDATA[<p><img src="https://s2.loli.net/2023/10/04/2YE8DWOANHUxJKf.png" /></p>
<hr />
<p><img src="https://nekomoe.pages.dev/images/mainVisual/char.jpg" /></p>
<hr />
<p>喵萌奶茶屋招募以下職位的小伙伴！</p>
<p>1.<strong>翻譯</strong>：沒有證書要求，能正確聽譯一集動畫即可</p>
<p>2.<strong>時軸</strong>：使用 Aegisub 準確拉軸對幀並設置合適的樣式、字體、螢幕字</p>
<p>3.<strong>後期</strong>：懂時軸基礎知識並使用 Vapoursynth 或 Avisynth 內嵌字幕，做種發布分流</p>
<p>4.<strong>壓制</strong>：能獨立寫程式碼最佳化畫質並使用 VapourSynth 或 AviSynth 壓製 BDRip / DVDRip</p>
<p>5.<strong>特效</strong>：熟練應用特效代碼製作合適的歌詞特效</p>
<p>6.<strong>畫師</strong>：畫海報、字幕娘、表情包、LOGO 等</p>
<p>7.<strong>分流</strong>：捐獻伺服器盒子永久保種本組合集資源</p>
<p>歡迎熱愛二次元熱衷字幕製作的小伙伴加入！申請請加入 QQ 群：421320480</p>
<p>粉絲群：477659567</p>
<hr />
<p>奶茶屋所有最新的【<a href="https://github.com/Nekomoekissaten/Nekomoekissaten-Subs" target="_blank" rel="external nofollow"><strong>外掛字幕</strong></a>】在這裡，如果有對本組做過的番有興趣的，歡迎來調 BD 軸！</p>
<p>本組發布的資源請以最新發布為準，最新的 TV 合集，最新的 BDRip 合集是最新修正的資源！</p>
<p>本組發布的外掛字幕請勿隨意修改後發布至公網！</p>
<p>點擊加入【<a href="https://jq.qq.com/?_wv=1027&amp;k=4ERTkKi" target="_blank" rel="external nofollow"><strong>奶茶分流小分隊</strong></a>】，為自己喜愛的番奉獻一份力量！</p>
<hr />
<p>從 2020 年 10 月新番起，本組發布的作品將去掉 Web 片源自帶的片頭！</p>]]></description>
<enclosure url="magnet:?xt=urn:btih:HJUGFUUID25E522H26ZDQFP6XJ3ZBA6R&amp;dn=&amp;tr=http%3A%2F%2F104.143.10.186%3A8000%2Fannounce&amp;tr=udp%3A%2F%2F104.143.10.186%3A8000%2Fannounce&amp;tr=http%3A%2F%2Ftracker.openbittorrent.com%3A80%2Fannounce&amp;tr=http%3A%2F%2Ftracker3.itzmx.com%3A6961%2Fannounce&amp;tr=http%3A%2F%2Ftracker4.itzmx.com%3A2710%2Fannounce&amp;tr=http%3A%2F%2Ftracker.publicbt.com%3A80%2Fannounce&amp;tr=http%3A%2F%2Ftracker.prq.to%2Fannounce&amp;tr=http%3A%2F%2Fopen.acgtracker.com%3A1096%2Fannounce&amp;tr=https%3A%2F%2Ft-115.rhcloud.com%2Fonly_for_ylbud&amp;tr=http%3A%2F%2Ftracker1.itzmx.com%3A8080%2Fannounce&amp;tr=http%3A%2F%2Ftracker2.itzmx.com%3A6961%2Fannounce&amp;tr=udp%3A%2F%2Ftracker1.itzmx.com%3A8080%2Fannounce&amp;tr=udp%3A%2F%2Ftracker2.itzmx.com%3A6961%2Fannounce&amp;tr=udp%3A%2F%2Ftracker3.itzmx.com%3A6961%2Fannounce&amp;tr=udp%3A%2F%2Ftracker4.itzmx.com%3A2710%2Fannounce&amp;tr=http%3A%2F%2Fnyaa.tracker.wf%3A7777%2Fannounce&amp;tr=http%3A%2F%2Ft.nyaatracker.com%2Fannounce&amp;tr=http%3A%2F%2Ft.acg.rip%3A6699%2Fannounce&amp;tr=http%3A%2F%2Ftr.bangumi.moe%3A6969%2Fannounce&amp;tr=http%3A%2F%2Fshare.camoe.cn%3A8080%2Fannounce&amp;tr=http%3A%2F%2Fsukebei.tracker.wf%3A8888%2Fannounce&amp;tr=http%3A%2F%2Fopenbittorrent.com%3A80%2Fannounce&amp;tr=https%3A%2F%2Fopentracker.i2p.rocks%3A443%2Fannounce&amp;tr=https%3A%2F%2Ftracker.nanoha.org%3A443%2Fannounce&amp;tr=https%3A%2F%2Ftracker.cyber-hub.net%3A443%2Fannounce&amp;tr=https%3A%2F%2Ftr.burnabyhighstar.com%3A443%2Fannounce"  length="1"  type="application/x-bittorrent" ></enclosure>
<author><![CDATA[nekomoekissaten]]></author>
<guid isPermaLink="true" >http://share.dmhy.org/topics/view/659909_10_Sousou_no_Frieren_16_1080p.html</guid>
<category domain="http://share.dmhy.org/topics/list/sort_id/2" ><![CDATA[動畫]]></category>
</item>
<item>
<title><![CDATA[【喵萌奶茶屋】★10月新番★[葬送的芙莉莲 / Sousou no Frieren][16][1080p][简日双语][招募翻译]]]></title>
<link>http://share.dmhy.org/topics/view/659908_10_Sousou_no_Frieren_16_1080p.html</link>
<pubDate>Fri, 05 Jan 2024 21:54:09 +0800</pubDate>
<description><![CDATA[<p><img src="https://s2.loli.net/2023/10/04/2YE8DWOANHUxJKf.png" /></p>
<hr />
<p><img src="https://nekomoe.pages.dev/images/mainVisual/char.jpg" /></p>
<hr />
<p>喵萌奶茶屋招募以下职位的小伙伴！</p>
<p>1.<strong>翻译</strong>：没有证书要求，能正确听译一集动画即可</p>
<p>2.<strong>时轴</strong>：使用 Aegisub 准确拉轴对帧并设置合适的样式、字体、屏幕字</p>
<p>3.<strong>后期</strong>：懂时轴基础知识并使用 Vapoursynth 或 Avisynth 内嵌字幕，做种发布分流</p>
<p>4.<strong>压制</strong>：能独立写代码优化画质并使用 VapourSynth 或 AviSynth 压制 BDRip / DVDRip</p>
<p>5.<strong>特效</strong>：熟练应用特效代码制作合适的歌词特效</p>
<p>6.<strong>画师</strong>：画海报、字幕娘、表情包、LOGO 等</p>
<p>7.<strong>分流</strong>：捐献服务器盒子永久保种本组合集资源</p>
<p>欢迎热爱二次元热衷字幕制作的小伙伴加入！申请请加入 QQ 群：421320480</p>
<p>粉丝群：477659567</p>
<hr />
<p>奶茶屋所有最新的【<a href="https://github.com/Nekomoekissaten/Nekomoekissaten-Subs" target="_blank" rel="external nofollow"><strong>外挂字幕</strong></a>】在这里，如果有对本组做过的番有兴趣的，欢迎来调 BD 轴！</p>
<p>本组发布的资源请以最新发布为准，最新的 TV 合集，最新的 BDRip 合集是最新修正的资源！</p>
<p>本组发布的外挂字幕请勿随意修改后发布至公网！</p>
<p>点击加入【<a href="https://jq.qq.com/?_wv=1027&amp;k=4ERTkKi" target="_blank" rel="external nofollow"><strong>奶茶分流小分队</strong></a>】，为自己喜爱的番奉献一份力量！</p>
<hr />
<p>从 2020 年 10 月新番起，本组发布的作品将去掉 Web 片源自带的片头！</p>]]></description>
<enclosure url="magnet:?xt=urn:btih:2NHLYS7UDBZW74ZPR7NKLOVHEQ6TJWC6&amp;dn=&amp;tr=http%3A%2F%2F104.143.10.186%3A8000%2Fannounce&amp;tr=udp%3A%2F%2F104.143.10.186%3A8000%2Fannounce&amp;tr=http%3A%2F%2Ftracker.openbittorrent.com%3A80%2Fannounce&amp;tr=http%3A%2F%2Ftracker3.itzmx.com%3A6961%2Fannounce&amp;tr=http%3A%2F%2Ftracker4.itzmx.com%3A2710%2Fannounce&amp;tr=http%3A%2F%2Ftracker.publicbt.com%3A80%2Fannounce&amp;tr=http%3A%2F%2Ftracker.prq.to%2Fannounce&amp;tr=http%3A%2F%2Fopen.acgtracker.com%3A1096%2Fannounce&amp;tr=https%3A%2F%2Ft-115.rhcloud.com%2Fonly_for_ylbud&amp;tr=http%3A%2F%2Ftracker1.itzmx.com%3A8080%2Fannounce&amp;tr=http%3A%2F%2Ftracker2.itzmx.com%3A6961%2Fannounce&amp;tr=udp%3A%2F%2Ftracker1.itzmx.com%3A8080%2Fannounce&amp;tr=udp%3A%2F%2Ftracker2.itzmx.com%3A6961%2Fannounce&amp;tr=udp%3A%2F%2Ftracker3.itzmx.com%3A6961%2Fannounce&amp;tr=udp%3A%2F%2Ftracker4.itzmx.com%3A2710%2Fannounce&amp;tr=http%3A%2F%2Fnyaa.tracker.wf%3A7777%2Fannounce&amp;tr=http%3A%2F%2Ft.nyaatracker.com%2Fannounce&amp;tr=http%3A%2F%2Ft.acg.rip%3A6699%2Fannounce&amp;tr=http%3A%2F%2Ftr.bangumi.moe%3A6969%2Fannounce&amp;tr=http%3A%2F%2Fshare.camoe.cn%3A8080%2Fannounce&amp;tr=http%3A%2F%2Fsukebei.tracker.wf%3A8888%2Fannounce&amp;tr=http%3A%2F%2Fopenbittorrent.com%3A80%2Fannounce&amp;tr=https%3A%2F%2Fopentracker.i2p.rocks%3A443%2Fannounce&amp;tr=https%3A%2F%2Ftracker.nanoha.org%3A443%2Fannounce&amp;tr=https%3A%2F%2Ftracker.cyber-hub.net%3A443%2Fannounce&amp;tr=https%3A%2F%2Ftr.burnabyhighstar.com%3A443%2Fannounce"  length="1"  type="application/x-bittorrent" ></enclosure>
<author><![CDATA[nekomoekissaten]]></author>
<guid isPermaLink="true" >http://share.dmhy.org/topics/view/659908_10_Sousou_no_Frieren_16_1080p.html</guid>
<category domain="http://share.dmhy.org/topics/list/sort_id/2" ><![CDATA[動畫]]></category>
</item>
<item>
<title><![CDATA[【喵萌奶茶屋】★10月新番★[葬送的芙莉蓮 / Sousou no Frieren][15][1080p][繁日雙語][招募翻譯]]]></title>
<link>http://share.dmhy.org/topics/view/658977_10_Sousou_no_Frieren_15_1080p.html</link>
<pubDate>Thu, 21 Dec 2023 07:25:00 +0800</pubDate>
<description><![CDATA[<p><img src="https://s2.loli.net/2023/10/04/2YE8DWOANHUxJKf.png" /></p>
<hr />
<p><img src="https://nekomoe.pages.dev/images/mainVisual/char.jpg" /></p>
<hr />
<p>喵萌奶茶屋招募以下職位的小伙伴！</p>
<p>1.<strong>翻譯</strong>：沒有證書要求，能正確聽譯一集動畫即可</p>
<p>2.<strong>時軸</strong>：使用 Aegisub 準確拉軸對幀並設置合適的樣式、字體、螢幕字</p>
<p>3.<strong>後期</strong>：懂時軸基礎知識並使用 Vapoursynth 或 Avisynth 內嵌字幕，做種發布分流</p>
<p>4.<strong>壓制</strong>：能獨立寫程式碼最佳化畫質並使用 VapourSynth 或 AviSynth 壓製 BDRip / DVDRip</p>
<p>5.<strong>特效</strong>：熟練應用特效代碼製作合適的歌詞特效</p>
<p>6.<strong>畫師</strong>：畫海報、字幕娘、表情包、LOGO 等</p>
<p>7.<strong>分流</strong>：捐獻伺服器盒子永久保種本組合集資源</p>
<p>歡迎熱愛二次元熱衷字幕製作的小伙伴加入！申請請加入 QQ 群：421320480</p>
<p>粉絲群：477659567</p>
<hr />
<p>奶茶屋所有最新的【<a href="https://github.com/Nekomoekissaten/Nekomoekissaten-Subs" target="_blank" rel="external nofollow"><strong>外掛字幕</strong></a>】在這裡，如果有對本組做過的番有興趣的，歡迎來調 BD 軸！</p>
<p>本組發布的資源請以最新發布為準，最新的 TV 合集，最新的 BDRip 合集是最新修正的資源！</p>
<p>本組發布的外掛字幕請勿隨意修改後發布至公網！</p>
<p>點擊加入【<a href="https://jq.qq.com/?_wv=1027&amp;k=4ERTkKi" target="_blank" rel="external nofollow"><strong>奶茶分流小分隊</strong></a>】，為自己喜愛的番奉獻一份力量！</p>
<hr />
<p>從 2020 年 10 月新番起，本組發布的作品將去掉 Web 片源自帶的片頭！</p>]]></description>
<enclosure url="magnet:?xt=urn:btih:XD24F5PCLXQ27DDNICXPTK27UJ4QZHHF&amp;dn=&amp;tr=http%3A%2F%2F104.143.10.186%3A8000%2Fannounce&amp;tr=udp%3A%2F%2F104.143.10.186%3A8000%2Fannounce&amp;tr=http%3A%2F%2Ftracker.openbittorrent.com%3A80%2Fannounce&amp;tr=http%3A%2F%2Ftracker3.itzmx.com%3A6961%2Fannounce&amp;tr=http%3A%2F%2Ftracker4.itzmx.com%3A2710%2Fannounce&amp;tr=http%3A%2F%2Ftracker.publicbt.com%3A80%2Fannounce&amp;tr=http%3A%2F%2Ftracker.prq.to%2Fannounce&amp;tr=http%3A%2F%2Fopen.acgtracker.com%3A1096%2Fannounce&amp;tr=https%3A%2F%2Ft-115.rhcloud.com%2Fonly_for_ylbud&amp;tr=http%3A%2F%2Ftracker1.itzmx.com%3A8080%2Fannounce&amp;tr=http%3A%2F%2Ftracker2.itzmx.com%3A6961%2Fannounce&amp;tr=udp%3A%2F%2Ftracker1.itzmx.com%3A8080%2Fannounce&amp;tr=udp%3A%2F%2Ftracker2.itzmx.com%3A6961%2Fannounce&amp;tr=udp%3A%2F%2Ftracker3.itzmx.com%3A6961%2Fannounce&amp;tr=udp%3A%2F%2Ftracker4.itzmx.com%3A2710%2Fannounce&amp;tr=http%3A%2F%2Fnyaa.tracker.wf%3A7777%2Fannounce&amp;tr=http%3A%2F%2Ft.nyaatracker.com%2Fannounce&amp;tr=http%3A%2F%2Ft.acg.rip%3A6699%2Fannounce&amp;tr=http%3A%2F%2Ftr.bangumi.moe%3A6969%2Fannounce&amp;tr=http%3A%2F%2Fshare.camoe.cn%3A8080%2Fannounce&amp;tr=http%3A%2F%2Fsukebei.tracker.wf%3A8888%2Fannounce&amp;tr=http%3A%2F%2Fopenbittorrent.com%3A80%2Fannounce&amp;tr=https%3A%2F%2Fopentracker.i2p.rocks%3A443%2Fannounce&amp;tr=https%3A%2F%2Ftracker.nanoha.org%3A443%2Fannounce&amp;tr=https%3A%2F%2Ftracker.cyber-hub.net%3A443%2Fannounce&amp;tr=https%3A%2F%2Ftr.burnabyhighstar.com%3A443%2Fannounce"  length="1"  type="application/x-bittorrent" ></enclosure>
<author><![CDATA[nekomoekissaten]]></author>
<guid isPermaLink="true" >http://share.dmhy.org/topics/view/658977_10_Sousou_no_Frieren_15_1080p.html</guid>
<category domain="http://share.dmhy.org/topics/list/sort_id/2" ><![CDATA[動畫]]></category>
</item>
<item>
<title><![CDATA[【喵萌奶茶屋】★10月新番★[葬送的芙莉莲 / Sousou no Frieren][15][1080p][简日双语][招募翻译]]]></title>
<link>http://share.dmhy.org/topics/view/658859_10_Sousou_no_Frieren_15_1080p.html</link>
<pubDate>Tue, 19 Dec 2023 22:47:03 +0800</pubDate>
<description><![CDATA[<p><img src="https://s2.loli.net/2023/10/04/2YE8DWOANHUxJKf.png" /></p>
<hr />
<p><img src="https://nekomoe.pages.dev/images/mainVisual/char.jpg" /></p>
<hr />
<p>喵萌奶茶屋招募以下职位的小伙伴！</p>
<p>1.<strong>翻译</strong>：没有证书要求，能正确听译一集动画即可</p>
<p>2.<strong>时轴</strong>：使用 Aegisub 准确拉轴对帧并设置合适的样式、字体、屏幕字</p>
<p>3.<strong>后期</strong>：懂时轴基础知识并使用 Vapoursynth 或 Avisynth 内嵌字幕，做种发布分流</p>
<p>4.<strong>压制</strong>：能独立写代码优化画质并使用 VapourSynth 或 AviSynth 压制 BDRip / DVDRip</p>
<p>5.<strong>特效</strong>：熟练应用特效代码制作合适的歌词特效</p>
<p>6.<strong>画师</strong>：画海报、字幕娘、表情包、LOGO 等</p>
<p>7.<strong>分流</strong>：捐献服务器盒子永久保种本组合集资源</p>
<p>欢迎热爱二次元热衷字幕制作的小伙伴加入！申请请加入 QQ 群：421320480</p>
<p>粉丝群：477659567</p>
<hr />
<p>奶茶屋所有最新的【<a href="https://github.com/Nekomoekissaten/Nekomoekissaten-Subs" target="_blank" rel="external nofollow"><strong>外挂字幕</strong></a>】在这里，如果有对本组做过的番有兴趣的，欢迎来调 BD 轴！</p>
<p>本组发布的资源请以最新发布为准，最新的 TV 合集，最新的 BDRip 合集是最新修正的资源！</p>
<p>本组发布的外挂字幕请勿随意修改后发布至公网！</p>
<p>点击加入【<a href="https://jq.qq.com/?_wv=1027&amp;k=4ERTkKi" target="_blank" rel="external nofollow"><strong>奶茶分流小分队</strong></a>】，为自己喜爱的番奉献一份力量！</p>
<hr />
<p>从 2020 年 10 月新番起，本组发布的作品将去掉 Web 片源自带的片头！</p>]]></description>
<enclosure url="magnet:?xt=urn:btih:NSXDQI5GROLYOMWWBPXSNZWNS2AIZFNJ&amp;dn=&amp;tr=http%3A%2F%2F104.143.10.186%3A8000%2Fannounce&amp;tr=udp%3A%2F%2F104.143.10.186%3A8000%2Fannounce&amp;tr=http%3A%2F%2Ftracker.openbittorrent.com%3A80%2Fannounce&amp;tr=http%3A%2F%2Ftracker3.itzmx.com%3A6961%2Fannounce&amp;tr=http%3A%2F%2Ftracker4.itzmx.com%3A2710%2Fannounce&amp;tr=http%3A%2F%2Ftracker.publicbt.com%3A80%2Fannounce&amp;tr=http%3A%2F%2Ftracker.prq.to%2Fannounce&amp;tr=http%3A%2F%2Fopen.acgtracker.com%3A1096%2Fannounce&amp;tr=https%3A%2F%2Ft-115.rhcloud.com%2Fonly_for_ylbud&amp;tr=http%3A%2F%2Ftracker1.itzmx.com%3A8080%2Fannounce&amp;tr=http%3A%2F%2Ftracker2.itzmx.com%3A6961%2Fannounce&amp;tr=udp%3A%2F%2Ftracker1.itzmx.com%3A8080%2Fannounce&amp;tr=udp%3A%2F%2Ftracker2.itzmx.com%3A6961%2Fannounce&amp;tr=udp%3A%2F%2Ftracker3.itzmx.com%3A6961%2Fannounce&amp;tr=udp%3A%2F%2Ftracker4.itzmx.com%3A2710%2Fannounce&amp;tr=http%3A%2F%2Fnyaa.tracker.wf%3A7777%2Fannounce&amp;tr=http%3A%2F%2Ft.nyaatracker.com%2Fannounce&amp;tr=http%3A%2F%2Ft.acg.rip%3A6699%2Fannounce&amp;tr=http%3A%2F%2Ftr.bangumi.moe%3A6969%2Fannounce&amp;tr=http%3A%2F%2Fshare.camoe.cn%3A8080%2Fannounce&amp;tr=http%3A%2F%2Fsukebei.tracker.wf%3A8888%2Fannounce&amp;tr=http%3A%2F%2Fopenbittorrent.com%3A80%2Fannounce&amp;tr=https%3A%2F%2Fopentracker.i2p.rocks%3A443%2Fannounce&amp;tr=https%3A%2F%2Ftracker.nanoha.org%3A443%2Fannounce&amp;tr=https%3A%2F%2Ftracker.cyber-hub.net%3A443%2Fannounce&amp;tr=https%3A%2F%2Ftr.burnabyhighstar.com%3A443%2Fannounce"  length="1"  type="application/x-bittorrent" ></enclosure>
<author><![CDATA[nekomoekissaten]]></author>
<guid isPermaLink="true" >http://share.dmhy.org/topics/view/658859_10_Sousou_no_Frieren_15_1080p.html</guid>
<category domain="http://share.dmhy.org/topics/list/sort_id/2" ><![CDATA[動畫]]></category>
</item>
<item>
<title><![CDATA[【喵萌奶茶屋】★10月新番★[葬送的芙莉蓮 / Sousou no Frieren][14][1080p][繁日雙語][招募翻譯]]]></title>
<link>http://share.dmhy.org/topics/view/658743_10_Sousou_no_Frieren_14_1080p.html</link>
<pubDate>Mon, 18 Dec 2023 11:31:39 +0800</pubDate>
<description><![CDATA[<p><img src="https://s2.loli.net/2023/10/04/2YE8DWOANHUxJKf.png" /></p>
<hr />
<p><img src="https://nekomoe.pages.dev/images/mainVisual/char.jpg" /></p>
<hr />
<p>喵萌奶茶屋招募以下職位的小伙伴！</p>
<p>1.<strong>翻譯</strong>：沒有證書要求，能正確聽譯一集動畫即可</p>
<p>2.<strong>時軸</strong>：使用 Aegisub 準確拉軸對幀並設置合適的樣式、字體、螢幕字</p>
<p>3.<strong>後期</strong>：懂時軸基礎知識並使用 Vapoursynth 或 Avisynth 內嵌字幕，做種發布分流</p>
<p>4.<strong>壓制</strong>：能獨立寫程式碼最佳化畫質並使用 VapourSynth 或 AviSynth 壓製 BDRip / DVDRip</p>
<p>5.<strong>特效</strong>：熟練應用特效代碼製作合適的歌詞特效</p>
<p>6.<strong>畫師</strong>：畫海報、字幕娘、表情包、LOGO 等</p>
<p>7.<strong>分流</strong>：捐獻伺服器盒子永久保種本組合集資源</p>
<p>歡迎熱愛二次元熱衷字幕製作的小伙伴加入！申請請加入 QQ 群：421320480</p>
<p>粉絲群：477659567</p>
<hr />
<p>奶茶屋所有最新的【<a href="https://github.com/Nekomoekissaten/Nekomoekissaten-Subs" target="_blank" rel="external nofollow"><strong>外掛字幕</strong></a>】在這裡，如果有對本組做過的番有興趣的，歡迎來調 BD 軸！</p>
<p>本組發布的資源請以最新發布為準，最新的 TV 合集，最新的 BDRip 合集是最新修正的資源！</p>
<p>本組發布的外掛字幕請勿隨意修改後發布至公網！</p>
<p>點擊加入【<a href="https://jq.qq.com/?_wv=1027&amp;k=4ERTkKi" target="_blank" rel="external nofollow"><strong>奶茶分流小分隊</strong></a>】，為自己喜愛的番奉獻一份力量！</p>
<hr />
<p>從 2020 年 10 月新番起，本組發布的作品將去掉 Web 片源自帶的片頭！</p>]]></description>
<enclosure url="magnet:?xt=urn:btih:YXGYN5DN5HISNUG277DBWBCUQIPC3QKA&amp;dn=&amp;tr=http%3A%2F%2F104.143.10.186%3A8000%2Fannounce&amp;tr=udp%3A%2F%2F104.143.10.186%3A8000%2Fannounce&amp;tr=http%3A%2F%2Ftracker.openbittorrent.com%3A80%2Fannounce&amp;tr=http%3A%2F%2Ftracker3.itzmx.com%3A6961%2Fannounce&amp;tr=http%3A%2F%2Ftracker4.itzmx.com%3A2710%2Fannounce&amp;tr=http%3A%2F%2Ftracker.publicbt.com%3A80%2Fannounce&amp;tr=http%3A%2F%2Ftracker.prq.to%2Fannounce&amp;tr=http%3A%2F%2Fopen.acgtracker.com%3A1096%2Fannounce&amp;tr=https%3A%2F%2Ft-115.rhcloud.com%2Fonly_for_ylbud&amp;tr=http%3A%2F%2Ftracker1.itzmx.com%3A8080%2Fannounce&amp;tr=http%3A%2F%2Ftracker2.itzmx.com%3A6961%2Fannounce&amp;tr=udp%3A%2F%2Ftracker1.itzmx.com%3A8080%2Fannounce&amp;tr=udp%3A%2F%2Ftracker2.itzmx.com%3A6961%2Fannounce&amp;tr=udp%3A%2F%2Ftracker3.itzmx.com%3A6961%2Fannounce&amp;tr=udp%3A%2F%2Ftracker4.itzmx.com%3A2710%2Fannounce&amp;tr=http%3A%2F%2Fnyaa.tracker.wf%3A7777%2Fannounce&amp;tr=http%3A%2F%2Ft.nyaatracker.com%2Fannounce&amp;tr=http%3A%2F%2Ft.acg.rip%3A6699%2Fannounce&amp;tr=http%3A%2F%2Ftr.bangumi.moe%3A6969%2Fannounce&amp;tr=http%3A%2F%2Fshare.camoe.cn%3A8080%2Fannounce&amp;tr=http%3A%2F%2Fsukebei.tracker.wf%3A8888%2Fannounce&amp;tr=http%3A%2F%2Fopenbittorrent.com%3A80%2Fannounce&amp;tr=https%3A%2F%2Fopentracker.i2p.rocks%3A443%2Fannounce&amp;tr=https%3A%2F%2Ftracker.nanoha.org%3A443%2Fannounce&amp;tr=https%3A%2F%2Ftracker.cyber-hub.net%3A443%2Fannounce&amp;tr=https%3A%2F%2Ftr.burnabyhighstar.com%3A443%2Fannounce"  length="1"  type="application/x-bittorrent" ></enclosure>
<author><![CDATA[nekomoekissaten]]></author>
<guid isPermaLink="true" >http://share.dmhy.org/topics/view/658743_10_Sousou_no_Frieren_14_1080p.html</guid>
<category domain="http://share.dmhy.org/topics/list/sort_id/2" ><![CDATA[動畫]]></category>
</item>
<item>
<title><![CDATA[【喵萌奶茶屋】★10月新番★[葬送的芙莉莲 / Sousou no Frieren][14][1080p][简日双语][招募翻译]]]></title>
<link>http://share.dmhy.org/topics/view/658412_10_Sousou_no_Frieren_14_1080p.html</link>
<pubDate>Thu, 14 Dec 2023 07:52:51 +0800</pubDate>
<description><![CDATA[<p><img src="https://s2.loli.net/2023/10/04/2YE8DWOANHUxJKf.png" /></p>
<hr />
<p><img src="https://nekomoe.pages.dev/images/mainVisual/char.jpg" /></p>
<hr />
<p>喵萌奶茶屋招募以下职位的小伙伴！</p>
<p>1.<strong>翻译</strong>：没有证书要求，能正确听译一集动画即可</p>
<p>2.<strong>时轴</strong>：使用 Aegisub 准确拉轴对帧并设置合适的样式、字体、屏幕字</p>
<p>3.<strong>后期</strong>：懂时轴基础知识并使用 Vapoursynth 或 Avisynth 内嵌字幕，做种发布分流</p>
<p>4.<strong>压制</strong>：能独立写代码优化画质并使用 VapourSynth 或 AviSynth 压制 BDRip / DVDRip</p>
<p>5.<strong>特效</strong>：熟练应用特效代码制作合适的歌词特效</p>
<p>6.<strong>画师</strong>：画海报、字幕娘、表情包、LOGO 等</p>
<p>7.<strong>分流</strong>：捐献服务器盒子永久保种本组合集资源</p>
<p>欢迎热爱二次元热衷字幕制作的小伙伴加入！申请请加入 QQ 群：421320480</p>
<p>粉丝群：477659567</p>
<hr />
<p>奶茶屋所有最新的【<a href="https://github.com/Nekomoekissaten/Nekomoekissaten-Subs" target="_blank" rel="external nofollow"><strong>外挂字幕</strong></a>】在这里，如果有对本组做过的番有兴趣的，欢迎来调 BD 轴！</p>
<p>本组发布的资源请以最新发布为准，最新的 TV 合集，最新的 BDRip 合集是最新修正的资源！</p>
<p>本组发布的外挂字幕请勿随意修改后发布至公网！</p>
<p>点击加入【<a href="https://jq.qq.com/?_wv=1027&amp;k=4ERTkKi" target="_blank" rel="external nofollow"><strong>奶茶分流小分队</strong></a>】，为自己喜爱的番奉献一份力量！</p>
<hr />
<p>从 2020 年 10 月新番起，本组发布的作品将去掉 Web 片源自带的片头！</p>]]></description>
<enclosure url="magnet:?xt=urn:btih:YGTZE6JLK6K4BOOTOOAOYKJFRG7AOW7H&amp;dn=&amp;tr=http%3A%2F%2F104.143.10.186%3A8000%2Fannounce&amp;tr=udp%3A%2F%2F104.143.10.186%3A8000%2Fannounce&amp;tr=http%3A%2F%2Ftracker.openbittorrent.com%3A80%2Fannounce&amp;tr=http%3A%2F%2Ftracker3.itzmx.com%3A6961%2Fannounce&amp;tr=http%3A%2F%2Ftracker4.itzmx.com%3A2710%2Fannounce&amp;tr=http%3A%2F%2Ftracker.publicbt.com%3A80%2Fannounce&amp;tr=http%3A%2F%2Ftracker.prq.to%2Fannounce&amp;tr=http%3A%2F%2Fopen.acgtracker.com%3A1096%2Fannounce&amp;tr=https%3A%2F%2Ft-115.rhcloud.com%2Fonly_for_ylbud&amp;tr=http%3A%2F%2Ftracker1.itzmx.com%3A8080%2Fannounce&amp;tr=http%3A%2F%2Ftracker2.itzmx.com%3A6961%2Fannounce&amp;tr=udp%3A%2F%2Ftracker1.itzmx.com%3A8080%2Fannounce&amp;tr=udp%3A%2F%2Ftracker2.itzmx.com%3A6961%2Fannounce&amp;tr=udp%3A%2F%2Ftracker3.itzmx.com%3A6961%2Fannounce&amp;tr=udp%3A%2F%2Ftracker4.itzmx.com%3A2710%2Fannounce&amp;tr=http%3A%2F%2Fnyaa.tracker.wf%3A7777%2Fannounce&amp;tr=http%3A%2F%2Ft.nyaatracker.com%2Fannounce&amp;tr=http%3A%2F%2Ft.acg.rip%3A6699%2Fannounce&amp;tr=http%3A%2F%2Ftr.bangumi.moe%3A6969%2Fannounce&amp;tr=http%3A%2F%2Fshare.camoe.cn%3A8080%2Fannounce&amp;tr=http%3A%2F%2Fsukebei.tracker.wf%3A8888%2Fannounce&amp;tr=http%3A%2F%2Fopenbittorrent.com%3A80%2Fannounce&amp;tr=https%3A%2F%2Fopentracker.i2p.rocks%3A443%2Fannounce&amp;tr=https%3A%2F%2Ftracker.nanoha.org%3A443%2Fannounce&amp;tr=https%3A%2F%2Ftracker.cyber-hub.net%3A443%2Fannounce&amp;tr=https%3A%2F%2Ftr.burnabyhighstar.com%3A443%2Fannounce"  length="1"  type="application/x-bittorrent" ></enclosure>
<author><![CDATA[nekomoekissaten]]></author>
<guid isPermaLink="true" >http://share.dmhy.org/topics/view/658412_10_Sousou_no_Frieren_14_1080p.html</guid>
<category domain="http://share.dmhy.org/topics/list/sort_id/2" ><![CDATA[動畫]]></category>
</item>
<item>
<title><![CDATA[【喵萌奶茶屋】★10月新番★[葬送的芙莉蓮 / Sousou no Frieren][13][1080p][繁日雙語][招募翻譯]]]></title>
<link>http://share.dmhy.org/topics/view/658133_10_Sousou_no_Frieren_13_1080p.html</link>
<pubDate>Sun, 10 Dec 2023 20:03:32 +0800</pubDate>
<description><![CDATA[<p><img src="https://s2.loli.net/2023/10/04/2YE8DWOANHUxJKf.png" /></p>
<hr />
<p><img src="https://nekomoe.pages.dev/images/mainVisual/char.jpg" /></p>
<hr />
<p>喵萌奶茶屋招募以下職位的小伙伴！</p>
<p>1.<strong>翻譯</strong>：沒有證書要求，能正確聽譯一集動畫即可</p>
<p>2.<strong>時軸</strong>：使用 Aegisub 準確拉軸對幀並設置合適的樣式、字體、螢幕字</p>
<p>3.<strong>後期</strong>：懂時軸基礎知識並使用 Vapoursynth 或 Avisynth 內嵌字幕，做種發布分流</p>
<p>4.<strong>壓制</strong>：能獨立寫程式碼最佳化畫質並使用 VapourSynth 或 AviSynth 壓製 BDRip / DVDRip</p>
<p>5.<strong>特效</strong>：熟練應用特效代碼製作合適的歌詞特效</p>
<p>6.<strong>畫師</strong>：畫海報、字幕娘、表情包、LOGO 等</p>
<p>7.<strong>分流</strong>：捐獻伺服器盒子永久保種本組合集資源</p>
<p>歡迎熱愛二次元熱衷字幕製作的小伙伴加入！申請請加入 QQ 群：421320480</p>
<p>粉絲群：477659567</p>
<hr />
<p>奶茶屋所有最新的【<a href="https://github.com/Nekomoekissaten/Nekomoekissaten-Subs" target="_blank" rel="external nofollow"><strong>外掛字幕</strong></a>】在這裡，如果有對本組做過的番有興趣的，歡迎來調 BD 軸！</p>
<p>本組發布的資源請以最新發布為準，最新的 TV 合集，最新的 BDRip 合集是最新修正的資源！</p>
<p>本組發布的外掛字幕請勿隨意修改後發布至公網！</p>
<p>點擊加入【<a href="https://jq.qq.com/?_wv=1027&amp;k=4ERTkKi" target="_blank" rel="external nofollow"><strong>奶茶分流小分隊</strong></a>】，為自己喜愛的番奉獻一份力量！</p>
<hr />
<p>從 2020 年 10 月新番起，本組發布的作品將去掉 Web 片源自帶的片頭！</p>]]></description>
<enclosure url="magnet:?xt=urn:btih:B57UUAHB4JJLKZAIZN73EWZWFZ43ZAPK&amp;dn=&amp;tr=http%3A%2F%2F104.143.10.186%3A8000%2Fannounce&amp;tr=udp%3A%2F%2F104.143.10.186%3A8000%2Fannounce&amp;tr=http%3A%2F%2Ftracker.openbittorrent.com%3A80%2Fannounce&amp;tr=http%3A%2F%2Ftracker3.itzmx.com%3A6961%2Fannounce&amp;tr=http%3A%2F%2Ftracker4.itzmx.com%3A2710%2Fannounce&amp;tr=http%3A%2F%2Ftracker.publicbt.com%3A80%2Fannounce&amp;tr=http%3A%2F%2Ftracker.prq.to%2Fannounce&amp;tr=http%3A%2F%2Fopen.acgtracker.com%3A1096%2Fannounce&amp;tr=https%3A%2F%2Ft-115.rhcloud.com%2Fonly_for_ylbud&amp;tr=http%3A%2F%2Ftracker1.itzmx.com%3A8080%2Fannounce&amp;tr=http%3A%2F%2Ftracker2.itzmx.com%3A6961%2Fannounce&amp;tr=udp%3A%2F%2Ftracker1.itzmx.com%3A8080%2Fannounce&amp;tr=udp%3A%2F%2Ftracker2.itzmx.com%3A6961%2Fannounce&amp;tr=udp%3A%2F%2Ftracker3.itzmx.com%3A6961%2Fannounce&amp;tr=udp%3A%2F%2Ftracker4.itzmx.com%3A2710%2Fannounce&amp;tr=http%3A%2F%2Fnyaa.tracker.wf%3A7777%2Fannounce&amp;tr=http%3A%2F%2Ft.nyaatracker.com%2Fannounce&amp;tr=http%3A%2F%2Ft.acg.rip%3A6699%2Fannounce&amp;tr=http%3A%2F%2Ftr.bangumi.moe%3A6969%2Fannounce&amp;tr=http%3A%2F%2Fshare.camoe.cn%3A8080%2Fannounce&amp;tr=http%3A%2F%2Fsukebei.tracker.wf%3A8888%2Fannounce&amp;tr=http%3A%2F%2Fopenbittorrent.com%3A80%2Fannounce&amp;tr=https%3A%2F%2Fopentracker.i2p.rocks%3A443%2Fannounce&amp;tr=https%3A%2F%2Ftracker.nanoha.org%3A443%2Fannounce&amp;tr=https%3A%2F%2Ftracker.cyber-hub.net%3A443%2Fannounce&amp;tr=https%3A%2F%2Ftr.burnabyhighstar.com%3A443%2Fannounce"  length="1"  type="application/x-bittorrent" ></enclosure>
<author><![CDATA[nekomoekissaten]]></author>
<guid isPermaLink="true" >http://share.dmhy.org/topics/view/658133_10_Sousou_no_Frieren_13_1080p.html</guid>
<category domain="http://share.dmhy.org/topics/list/sort_id/2" ><![CDATA[動畫]]></category>
</item>
<item>
<title><![CDATA[【喵萌奶茶屋】★10月新番★[葬送的芙莉莲 / Sousou no Frieren][13][1080p][简日双语][招募翻译]]]></title>
<link>http://share.dmhy.org/topics/view/657618_10_Sousou_no_Frieren_13_1080p.html</link>
<pubDate>Wed, 06 Dec 2023 08:10:08 +0800</pubDate>
<description><![CDATA[<p><img src="https://s2.loli.net/2023/10/04/2YE8DWOANHUxJKf.png" /></p>
<hr />
<p><img src="https://nekomoe.pages.dev/images/mainVisual/char.jpg" /></p>
<hr />
<p>喵萌奶茶屋招募以下职位的小伙伴！</p>
<p>1.<strong>翻译</strong>：没有证书要求，能正确听译一集动画即可</p>
<p>2.<strong>时轴</strong>：使用 Aegisub 准确拉轴对帧并设置合适的样式、字体、屏幕字</p>
<p>3.<strong>后期</strong>：懂时轴基础知识并使用 Vapoursynth 或 Avisynth 内嵌字幕，做种发布分流</p>
<p>4.<strong>压制</strong>：能独立写代码优化画质并使用 VapourSynth 或 AviSynth 压制 BDRip / DVDRip</p>
<p>5.<strong>特效</strong>：熟练应用特效代码制作合适的歌词特效</p>
<p>6.<strong>画师</strong>：画海报、字幕娘、表情包、LOGO 等</p>
<p>7.<strong>分流</strong>：捐献服务器盒子永久保种本组合集资源</p>
<p>欢迎热爱二次元热衷字幕制作的小伙伴加入！申请请加入 QQ 群：421320480</p>
<p>粉丝群：477659567</p>
<hr />
<p>奶茶屋所有最新的【<a href="https://github.com/Nekomoekissaten/Nekomoekissaten-Subs" target="_blank" rel="external nofollow"><strong>外挂字幕</strong></a>】在这里，如果有对本组做过的番有兴趣的，欢迎来调 BD 轴！</p>
<p>本组发布的资源请以最新发布为准，最新的 TV 合集，最新的 BDRip 合集是最新修正的资源！</p>
<p>本组发布的外挂字幕请勿随意修改后发布至公网！</p>
<p>点击加入【<a href="https://jq.qq.com/?_wv=1027&amp;k=4ERTkKi" target="_blank" rel="external nofollow"><strong>奶茶分流小分队</strong></a>】，为自己喜爱的番奉献一份力量！</p>
<hr />
<p>从 2020 年 10 月新番起，本组发布的作品将去掉 Web 片源自带的片头！</p>]]></description>
<enclosure url="magnet:?xt=urn:btih:QECCXBNBTK7P2T2IAS7VJD526UFZDJCK&amp;dn=&amp;tr=http%3A%2F%2F104.143.10.186%3A8000%2Fannounce&amp;tr=udp%3A%2F%2F104.143.10.186%3A8000%2Fannounce&amp;tr=http%3A%2F%2Ftracker.openbittorrent.com%3A80%2Fannounce&amp;tr=http%3A%2F%2Ftracker3.itzmx.com%3A6961%2Fannounce&amp;tr=http%3A%2F%2Ftracker4.itzmx.com%3A2710%2Fannounce&amp;tr=http%3A%2F%2Ftracker.publicbt.com%3A80%2Fannounce&amp;tr=http%3A%2F%2Ftracker.prq.to%2Fannounce&amp;tr=http%3A%2F%2Fopen.acgtracker.com%3A1096%2Fannounce&amp;tr=https%3A%2F%2Ft-115.rhcloud.com%2Fonly_for_ylbud&amp;tr=http%3A%2F%2Ftracker1.itzmx.com%3A8080%2Fannounce&amp;tr=http%3A%2F%2Ftracker2.itzmx.com%3A6961%2Fannounce&amp;tr=udp%3A%2F%2Ftracker1.itzmx.com%3A8080%2Fannounce&amp;tr=udp%3A%2F%2Ftracker2.itzmx.com%3A6961%2Fannounce&amp;tr=udp%3A%2F%2Ftracker3.itzmx.com%3A6961%2Fannounce&amp;tr=udp%3A%2F%2Ftracker4.itzmx.com%3A2710%2Fannounce&amp;tr=http%3A%2F%2Fnyaa.tracker.wf%3A7777%2Fannounce&amp;tr=http%3A%2F%2Ft.nyaatracker.com%2Fannounce&amp;tr=http%3A%2F%2Ft.acg.rip%3A6699%2Fannounce&amp;tr=http%3A%2F%2Ftr.bangumi.moe%3A6969%2Fannounce&amp;tr=http%3A%2F%2Fshare.camoe.cn%3A8080%2Fannounce&amp;tr=http%3A%2F%2Fsukebei.tracker.wf%3A8888%2Fannounce&amp;tr=http%3A%2F%2Fopenbittorrent.com%3A80%2Fannounce&amp;tr=https%3A%2F%2Fopentracker.i2p.rocks%3A443%2Fannounce&amp;tr=https%3A%2F%2Ftracker.nanoha.org%3A443%2Fannounce&amp;tr=https%3A%2F%2Ftracker.cyber-hub.net%3A443%2Fannounce&amp;tr=https%3A%2F%2Ftr.burnabyhighstar.com%3A443%2Fannounce"  length="1"  type="application/x-bittorrent" ></enclosure>
<author><![CDATA[nekomoekissaten]]></author>
<guid isPermaLink="true" >http://share.dmhy.org/topics/view/657618_10_Sousou_no_Frieren_13_1080p.html</guid>
<category domain="http://share.dmhy.org/topics/list/sort_id/2" ><![CDATA[動畫]]></category>
</item>
<item>
<title><![CDATA[【喵萌奶茶屋】★10月新番★[葬送的芙莉蓮 / Sousou no Frieren][12][1080p][繁日雙語][招募翻譯]]]></title>
<link>http://share.dmhy.org/topics/view/657258_10_Sousou_no_Frieren_12_1080p.html</link>
<pubDate>Thu, 30 Nov 2023 18:34:39 +0800</pubDate>
<description><![CDATA[<p><img src="https://s2.loli.net/2023/10/04/2YE8DWOANHUxJKf.png" /></p>
<hr />
<p><img src="https://nekomoe.pages.dev/images/mainVisual/char.jpg" /></p>
<hr />
<p>喵萌奶茶屋招募以下職位的小伙伴！</p>
<p>1.<strong>翻譯</strong>：沒有證書要求，能正確聽譯一集動畫即可</p>
<p>2.<strong>時軸</strong>：使用 Aegisub 準確拉軸對幀並設置合適的樣式、字體、螢幕字</p>
<p>3.<strong>後期</strong>：懂時軸基礎知識並使用 Vapoursynth 或 Avisynth 內嵌字幕，做種發布分流</p>
<p>4.<strong>壓制</strong>：能獨立寫程式碼最佳化畫質並使用 VapourSynth 或 AviSynth 壓製 BDRip / DVDRip</p>
<p>5.<strong>特效</strong>：熟練應用特效代碼製作合適的歌詞特效</p>
<p>6.<strong>畫師</strong>：畫海報、字幕娘、表情包、LOGO 等</p>
<p>7.<strong>分流</strong>：捐獻伺服器盒子永久保種本組合集資源</p>
<p>歡迎熱愛二次元熱衷字幕製作的小伙伴加入！申請請加入 QQ 群：421320480</p>
<p>粉絲群：477659567</p>
<hr />
<p>奶茶屋所有最新的【<a href="https://github.com/Nekomoekissaten/Nekomoekissaten-Subs" target="_blank" rel="external nofollow"><strong>外掛字幕</strong></a>】在這裡，如果有對本組做過的番有興趣的，歡迎來調 BD 軸！</p>
<p>本組發布的資源請以最新發布為準，最新的 TV 合集，最新的 BDRip 合集是最新修正的資源！</p>
<p>本組發布的外掛字幕請勿隨意修改後發布至公網！</p>
<p>點擊加入【<a href="https://jq.qq.com/?_wv=1027&amp;k=4ERTkKi" target="_blank" rel="external nofollow"><strong>奶茶分流小分隊</strong></a>】，為自己喜愛的番奉獻一份力量！</p>
<hr />
<p>從 2020 年 10 月新番起，本組發布的作品將去掉 Web 片源自帶的片頭！</p>]]></description>
<enclosure url="magnet:?xt=urn:btih:Y6EYLVIHKG3MGQ6AHUSVMTNPQZW4EJ5W&amp;dn=&amp;tr=http%3A%2F%2F104.143.10.186%3A8000%2Fannounce&amp;tr=udp%3A%2F%2F104.143.10.186%3A8000%2Fannounce&amp;tr=http%3A%2F%2Ftracker.openbittorrent.com%3A80%2Fannounce&amp;tr=http%3A%2F%2Ftracker3.itzmx.com%3A6961%2Fannounce&amp;tr=http%3A%2F%2Ftracker4.itzmx.com%3A2710%2Fannounce&amp;tr=http%3A%2F%2Ftracker.publicbt.com%3A80%2Fannounce&amp;tr=http%3A%2F%2Ftracker.prq.to%2Fannounce&amp;tr=http%3A%2F%2Fopen.acgtracker.com%3A1096%2Fannounce&amp;tr=https%3A%2F%2Ft-115.rhcloud.com%2Fonly_for_ylbud&amp;tr=http%3A%2F%2Ftracker1.itzmx.com%3A8080%2Fannounce&amp;tr=http%3A%2F%2Ftracker2.itzmx.com%3A6961%2Fannounce&amp;tr=udp%3A%2F%2Ftracker1.itzmx.com%3A8080%2Fannounce&amp;tr=udp%3A%2F%2Ftracker2.itzmx.com%3A6961%2Fannounce&amp;tr=udp%3A%2F%2Ftracker3.itzmx.com%3A6961%2Fannounce&amp;tr=udp%3A%2F%2Ftracker4.itzmx.com%3A2710%2Fannounce&amp;tr=http%3A%2F%2Fnyaa.tracker.wf%3A7777%2Fannounce&amp;tr=http%3A%2F%2Ft.nyaatracker.com%2Fannounce&amp;tr=http%3A%2F%2Ft.acg.rip%3A6699%2Fannounce&amp;tr=http%3A%2F%2Ftr.bangumi.moe%3A6969%2Fannounce&amp;tr=http%3A%2F%2Fshare.camoe.cn%3A8080%2Fannounce&amp;tr=http%3A%2F%2Fsukebei.tracker.wf%3A8888%2Fannounce&amp;tr=http%3A%2F%2Fopenbittorrent.com%3A80%2Fannounce&amp;tr=https%3A%2F%2Fopentracker.i2p.rocks%3A443%2Fannounce&amp;tr=https%3A%2F%2Ftracker.nanoha.org%3A443%2Fannounce&amp;tr=https%3A%2F%2Ftracker.cyber-hub.net%3A443%2Fannounce&amp;tr=https%3A%2F%2Ftr.burnabyhighstar.com%3A443%2Fannounce"  length="1"  type="application/x-bittorrent" ></enclosure>
<author><![CDATA[nekomoekissaten]]></author>
<guid isPermaLink="true" >http://share.dmhy.org/topics/view/657258_10_Sousou_no_Frieren_12_1080p.html</guid>
<category domain="http://share.dmhy.org/topics/list/sort_id/2" ><![CDATA[動畫]]></category>
</item>
<item>
<title><![CDATA[【喵萌奶茶屋】★10月新番★[葬送的芙莉莲 / Sousou no Frieren][12][1080p][简日双语][招募翻译]]]></title>
<link>http://share.dmhy.org/topics/view/657257_10_Sousou_no_Frieren_12_1080p.html</link>
<pubDate>Thu, 30 Nov 2023 18:34:30 +0800</pubDate>
<description><![CDATA[<p><img src="https://s2.loli.net/2023/10/04/2YE8DWOANHUxJKf.png" /></p>
<hr />
<p><img src="https://nekomoe.pages.dev/images/mainVisual/char.jpg" /></p>
<hr />
<p>喵萌奶茶屋招募以下职位的小伙伴！</p>
<p>1.<strong>翻译</strong>：没有证书要求，能正确听译一集动画即可</p>
<p>2.<strong>时轴</strong>：使用 Aegisub 准确拉轴对帧并设置合适的样式、字体、屏幕字</p>
<p>3.<strong>后期</strong>：懂时轴基础知识并使用 Vapoursynth 或 Avisynth 内嵌字幕，做种发布分流</p>
<p>4.<strong>压制</strong>：能独立写代码优化画质并使用 VapourSynth 或 AviSynth 压制 BDRip / DVDRip</p>
<p>5.<strong>特效</strong>：熟练应用特效代码制作合适的歌词特效</p>
<p>6.<strong>画师</strong>：画海报、字幕娘、表情包、LOGO 等</p>
<p>7.<strong>分流</strong>：捐献服务器盒子永久保种本组合集资源</p>
<p>欢迎热爱二次元热衷字幕制作的小伙伴加入！申请请加入 QQ 群：421320480</p>
<p>粉丝群：477659567</p>
<hr />
<p>奶茶屋所有最新的【<a href="https://github.com/Nekomoekissaten/Nekomoekissaten-Subs" target="_blank" rel="external nofollow"><strong>外挂字幕</strong></a>】在这里，如果有对本组做过的番有兴趣的，欢迎来调 BD 轴！</p>
<p>本组发布的资源请以最新发布为准，最新的 TV 合集，最新的 BDRip 合集是最新修正的资源！</p>
<p>本组发布的外挂字幕请勿随意修改后发布至公网！</p>
<p>点击加入【<a href="https://jq.qq.com/?_wv=1027&amp;k=4ERTkKi" target="_blank" rel="external nofollow"><strong>奶茶分流小分队</strong></a>】，为自己喜爱的番奉献一份力量！</p>
<hr />
<p>从 2020 年 10 月新番起，本组发布的作品将去掉 Web 片源自带的片头！</p>]]></description>
<enclosure url="magnet:?xt=urn:btih:LOSGBLMKKJV4HZZLAROHHF3GKVLTCYY6&amp;dn=&amp;tr=http%3A%2F%2F104.143.10.186%3A8000%2Fannounce&amp;tr=udp%3A%2F%2F104.143.10.186%3A8000%2Fannounce&amp;tr=http%3A%2F%2Ftracker.openbittorrent.com%3A80%2Fannounce&amp;tr=http%3A%2F%2Ftracker3.itzmx.com%3A6961%2Fannounce&amp;tr=http%3A%2F%2Ftracker4.itzmx.com%3A2710%2Fannounce&amp;tr=http%3A%2F%2Ftracker.publicbt.com%3A80%2Fannounce&amp;tr=http%3A%2F%2Ftracker.prq.to%2Fannounce&amp;tr=http%3A%2F%2Fopen.acgtracker.com%3A1096%2Fannounce&amp;tr=https%3A%2F%2Ft-115.rhcloud.com%2Fonly_for_ylbud&amp;tr=http%3A%2F%2Ftracker1.itzmx.com%3A8080%2Fannounce&amp;tr=http%3A%2F%2Ftracker2.itzmx.com%3A6961%2Fannounce&amp;tr=udp%3A%2F%2Ftracker1.itzmx.com%3A8080%2Fannounce&amp;tr=udp%3A%2F%2Ftracker2.itzmx.com%3A6961%2Fannounce&amp;tr=udp%3A%2F%2Ftracker3.itzmx.com%3A6961%2Fannounce&amp;tr=udp%3A%2F%2Ftracker4.itzmx.com%3A2710%2Fannounce&amp;tr=http%3A%2F%2Fnyaa.tracker.wf%3A7777%2Fannounce&amp;tr=http%3A%2F%2Ft.nyaatracker.com%2Fannounce&amp;tr=http%3A%2F%2Ft.acg.rip%3A6699%2Fannounce&amp;tr=http%3A%2F%2Ftr.bangumi.moe%3A6969%2Fannounce&amp;tr=http%3A%2F%2Fshare.camoe.cn%3A8080%2Fannounce&amp;tr=http%3A%2F%2Fsukebei.tracker.wf%3A8888%2Fannounce&amp;tr=http%3A%2F%2Fopenbittorrent.com%3A80%2Fannounce&amp;tr=https%3A%2F%2Fopentracker.i2p.rocks%3A443%2Fannounce&amp;tr=https%3A%2F%2Ftracker.nanoha.org%3A443%2Fannounce&amp;tr=https%3A%2F%2Ftracker.cyber-hub.net%3A443%2Fannounce&amp;tr=https%3A%2F%2Ftr.burnabyhighstar.com%3A443%2Fannounce"  length="1"  type="application/x-bittorrent" ></enclosure>
<author><![CDATA[nekomoekissaten]]></author>
<guid isPermaLink="true" >http://share.dmhy.org/topics/view/657257_10_Sousou_no_Frieren_12_1080p.html</guid>
<category domain="http://share.dmhy.org/topics/list/sort_id/2" ><![CDATA[動畫]]></category>
</item>
<item>
<title><![CDATA[【喵萌奶茶屋】★10月新番★[葬送的芙莉蓮 / Sousou no Frieren][11][1080p][繁日雙語][招募翻譯]]]></title>
<link>http://share.dmhy.org/topics/view/656775_10_Sousou_no_Frieren_11_1080p.html</link>
<pubDate>Tue, 21 Nov 2023 08:11:51 +0800</pubDate>
<description><![CDATA[<p><img src="https://s2.loli.net/2023/10/04/2YE8DWOANHUxJKf.png" /></p>
<hr />
<p><img src="https://nekomoe.pages.dev/images/mainVisual/char.jpg" /></p>
<hr />
<p>喵萌奶茶屋招募以下職位的小伙伴！</p>
<p>1.<strong>翻譯</strong>：沒有證書要求，能正確聽譯一集動畫即可</p>
<p>2.<strong>時軸</strong>：使用 Aegisub 準確拉軸對幀並設置合適的樣式、字體、螢幕字</p>
<p>3.<strong>後期</strong>：懂時軸基礎知識並使用 Vapoursynth 或 Avisynth 內嵌字幕，做種發布分流</p>
<p>4.<strong>壓制</strong>：能獨立寫程式碼最佳化畫質並使用 VapourSynth 或 AviSynth 壓製 BDRip / DVDRip</p>
<p>5.<strong>特效</strong>：熟練應用特效代碼製作合適的歌詞特效</p>
<p>6.<strong>畫師</strong>：畫海報、字幕娘、表情包、LOGO 等</p>
<p>7.<strong>分流</strong>：捐獻伺服器盒子永久保種本組合集資源</p>
<p>歡迎熱愛二次元熱衷字幕製作的小伙伴加入！申請請加入 QQ 群：421320480</p>
<p>粉絲群：477659567</p>
<hr />
<p>奶茶屋所有最新的【<a href="https://github.com/Nekomoekissaten/Nekomoekissaten-Subs" target="_blank" rel="external nofollow"><strong>外掛字幕</strong></a>】在這裡，如果有對本組做過的番有興趣的，歡迎來調 BD 軸！</p>
<p>本組發布的資源請以最新發布為準，最新的 TV 合集，最新的 BDRip 合集是最新修正的資源！</p>
<p>本組發布的外掛字幕請勿隨意修改後發布至公網！</p>
<p>點擊加入【<a href="https://jq.qq.com/?_wv=1027&amp;k=4ERTkKi" target="_blank" rel="external nofollow"><strong>奶茶分流小分隊</strong></a>】，為自己喜愛的番奉獻一份力量！</p>
<hr />
<p>從 2020 年 10 月新番起，本組發布的作品將去掉 Web 片源自帶的片頭！</p>]]></description>
<enclosure url="magnet:?xt=urn:btih:4XMSFS7RXRZYRMUE5HWS44QMMNKOKCIH&amp;dn=&amp;tr=http%3A%2F%2F104.143.10.186%3A8000%2Fannounce&amp;tr=udp%3A%2F%2F104.143.10.186%3A8000%2Fannounce&amp;tr=http%3A%2F%2Ftracker.openbittorrent.com%3A80%2Fannounce&amp;tr=http%3A%2F%2Ftracker3.itzmx.com%3A6961%2Fannounce&amp;tr=http%3A%2F%2Ftracker4.itzmx.com%3A2710%2Fannounce&amp;tr=http%3A%2F%2Ftracker.publicbt.com%3A80%2Fannounce&amp;tr=http%3A%2F%2Ftracker.prq.to%2Fannounce&amp;tr=http%3A%2F%2Fopen.acgtracker.com%3A1096%2Fannounce&amp;tr=https%3A%2F%2Ft-115.rhcloud.com%2Fonly_for_ylbud&amp;tr=http%3A%2F%2Ftracker1.itzmx.com%3A8080%2Fannounce&amp;tr=http%3A%2F%2Ftracker2.itzmx.com%3A6961%2Fannounce&amp;tr=udp%3A%2F%2Ftracker1.itzmx.com%3A8080%2Fannounce&amp;tr=udp%3A%2F%2Ftracker2.itzmx.com%3A6961%2Fannounce&amp;tr=udp%3A%2F%2Ftracker3.itzmx.com%3A6961%2Fannounce&amp;tr=udp%3A%2F%2Ftracker4.itzmx.com%3A2710%2Fannounce&amp;tr=http%3A%2F%2Fnyaa.tracker.wf%3A7777%2Fannounce&amp;tr=http%3A%2F%2Ft.nyaatracker.com%2Fannounce&amp;tr=http%3A%2F%2Ft.acg.rip%3A6699%2Fannounce&amp;tr=http%3A%2F%2Ftr.bangumi.moe%3A6969%2Fannounce&amp;tr=http%3A%2F%2Fshare.camoe.cn%3A8080%2Fannounce&amp;tr=http%3A%2F%2Fsukebei.tracker.wf%3A8888%2Fannounce&amp;tr=http%3A%2F%2Fopenbittorrent.com%3A80%2Fannounce&amp;tr=https%3A%2F%2Fopentracker.i2p.rocks%3A443%2Fannounce&amp;tr=https%3A%2F%2Ftracker.nanoha.org%3A443%2Fannounce&amp;tr=https%3A%2F%2Ftracker.cyber-hub.net%3A443%2Fannounce&amp;tr=https%3A%2F%2Ftr.burnabyhighstar.com%3A443%2Fannounce"  length="1"  type="application/x-bittorrent" ></enclosure>
<author><![CDATA[nekomoekissaten]]></author>
<guid isPermaLink="true" >http://share.dmhy.org/topics/view/656775_10_Sousou_no_Frieren_11_1080p.html</guid>
<category domain="http://share.dmhy.org/topics/list/sort_id/2" ><![CDATA[動畫]]></category>
</item>
<item>
<title><![CDATA[【喵萌奶茶屋】★10月新番★[葬送的芙莉莲 / Sousou no Frieren][11][1080p][简日双语][招募翻译]]]></title>
<link>http://share.dmhy.org/topics/view/656774_10_Sousou_no_Frieren_11_1080p.html</link>
<pubDate>Tue, 21 Nov 2023 08:11:23 +0800</pubDate>
<description><![CDATA[<p><img src="https://s2.loli.net/2023/10/04/2YE8DWOANHUxJKf.png" /></p>
<hr />
<p><img src="https://nekomoe.pages.dev/images/mainVisual/char.jpg" /></p>
<hr />
<p>喵萌奶茶屋招募以下职位的小伙伴！</p>
<p>1.<strong>翻译</strong>：没有证书要求，能正确听译一集动画即可</p>
<p>2.<strong>时轴</strong>：使用 Aegisub 准确拉轴对帧并设置合适的样式、字体、屏幕字</p>
<p>3.<strong>后期</strong>：懂时轴基础知识并使用 Vapoursynth 或 Avisynth 内嵌字幕，做种发布分流</p>
<p>4.<strong>压制</strong>：能独立写代码优化画质并使用 VapourSynth 或 AviSynth 压制 BDRip / DVDRip</p>
<p>5.<strong>特效</strong>：熟练应用特效代码制作合适的歌词特效</p>
<p>6.<strong>画师</strong>：画海报、字幕娘、表情包、LOGO 等</p>
<p>7.<strong>分流</strong>：捐献服务器盒子永久保种本组合集资源</p>
<p>欢迎热爱二次元热衷字幕制作的小伙伴加入！申请请加入 QQ 群：421320480</p>
<p>粉丝群：477659567</p>
<hr />
<p>奶茶屋所有最新的【<a href="https://github.com/Nekomoekissaten/Nekomoekissaten-Subs" target="_blank" rel="external nofollow"><strong>外挂字幕</strong></a>】在这里，如果有对本组做过的番有兴趣的，欢迎来调 BD 轴！</p>
<p>本组发布的资源请以最新发布为准，最新的 TV 合集，最新的 BDRip 合集是最新修正的资源！</p>
<p>本组发布的外挂字幕请勿随意修改后发布至公网！</p>
<p>点击加入【<a href="https://jq.qq.com/?_wv=1027&amp;k=4ERTkKi" target="_blank" rel="external nofollow"><strong>奶茶分流小分队</strong></a>】，为自己喜爱的番奉献一份力量！</p>
<hr />
<p>从 2020 年 10 月新番起，本组发布的作品将去掉 Web 片源自带的片头！</p>]]></description>
<enclosure url="magnet:?xt=urn:btih:VOU6JUPBBP7TVZ6ML73ECWLYCNQARATJ&amp;dn=&amp;tr=http%3A%2F%2F104.143.10.186%3A8000%2Fannounce&amp;tr=udp%3A%2F%2F104.143.10.186%3A8000%2Fannounce&amp;tr=http%3A%2F%2Ftracker.openbittorrent.com%3A80%2Fannounce&amp;tr=http%3A%2F%2Ftracker3.itzmx.com%3A6961%2Fannounce&amp;tr=http%3A%2F%2Ftracker4.itzmx.com%3A2710%2Fannounce&amp;tr=http%3A%2F%2Ftracker.publicbt.com%3A80%2Fannounce&amp;tr=http%3A%2F%2Ftracker.prq.to%2Fannounce&amp;tr=http%3A%2F%2Fopen.acgtracker.com%3A1096%2Fannounce&amp;tr=https%3A%2F%2Ft-115.rhcloud.com%2Fonly_for_ylbud&amp;tr=http%3A%2F%2Ftracker1.itzmx.com%3A8080%2Fannounce&amp;tr=http%3A%2F%2Ftracker2.itzmx.com%3A6961%2Fannounce&amp;tr=udp%3A%2F%2Ftracker1.itzmx.com%3A8080%2Fannounce&amp;tr=udp%3A%2F%2Ftracker2.itzmx.com%3A6961%2Fannounce&amp;tr=udp%3A%2F%2Ftracker3.itzmx.com%3A6961%2Fannounce&amp;tr=udp%3A%2F%2Ftracker4.itzmx.com%3A2710%2Fannounce&amp;tr=http%3A%2F%2Fnyaa.tracker.wf%3A7777%2Fannounce&amp;tr=http%3A%2F%2Ft.nyaatracker.com%2Fannounce&amp;tr=http%3A%2F%2Ft.acg.rip%3A6699%2Fannounce&amp;tr=http%3A%2F%2Ftr.bangumi.moe%3A6969%2Fannounce&amp;tr=http%3A%2F%2Fshare.camoe.cn%3A8080%2Fannounce&amp;tr=http%3A%2F%2Fsukebei.tracker.wf%3A8888%2Fannounce&amp;tr=http%3A%2F%2Fopenbittorrent.com%3A80%2Fannounce&amp;tr=https%3A%2F%2Fopentracker.i2p.rocks%3A443%2Fannounce&amp;tr=https%3A%2F%2Ftracker.nanoha.org%3A443%2Fannounce&amp;tr=https%3A%2F%2Ftracker.cyber-hub.net%3A443%2Fannounce&amp;tr=https%3A%2F%2Ftr.burnabyhighstar.com%3A443%2Fannounce"  length="1"  type="application/x-bittorrent" ></enclosure>
<author><![CDATA[nekomoekissaten]]></author>
<guid isPermaLink="true" >http://share.dmhy.org/topics/view/656774_10_Sousou_no_Frieren_11_1080p.html</guid>
<category domain="http://share.dmhy.org/topics/list/sort_id/2" ><![CDATA[動畫]]></category>
</item>
<item>
<title><![CDATA[【喵萌奶茶屋】★10月新番★[葬送的芙莉蓮 / Sousou no Frieren][10][1080p][繁日雙語][v2][招募翻譯]]]></title>
<link>http://share.dmhy.org/topics/view/656439_10_Sousou_no_Frieren_10_1080p_v2.html</link>
<pubDate>Thu, 16 Nov 2023 19:05:02 +0800</pubDate>
<description><![CDATA[<p><img src="https://s2.loli.net/2023/10/04/2YE8DWOANHUxJKf.png" /></p>
<hr />
<p><img src="https://nekomoe.pages.dev/images/mainVisual/char.jpg" /></p>
<hr />
<p>喵萌奶茶屋招募以下職位的小伙伴！</p>
<p>1.<strong>翻譯</strong>：沒有證書要求，能正確聽譯一集動畫即可</p>
<p>2.<strong>時軸</strong>：使用 Aegisub 準確拉軸對幀並設置合適的樣式、字體、螢幕字</p>
<p>3.<strong>後期</strong>：懂時軸基礎知識並使用 Vapoursynth 或 Avisynth 內嵌字幕，做種發布分流</p>
<p>4.<strong>壓制</strong>：能獨立寫程式碼最佳化畫質並使用 VapourSynth 或 AviSynth 壓製 BDRip / DVDRip</p>
<p>5.<strong>特效</strong>：熟練應用特效代碼製作合適的歌詞特效</p>
<p>6.<strong>畫師</strong>：畫海報、字幕娘、表情包、LOGO 等</p>
<p>7.<strong>分流</strong>：捐獻伺服器盒子永久保種本組合集資源</p>
<p>歡迎熱愛二次元熱衷字幕製作的小伙伴加入！申請請加入 QQ 群：421320480</p>
<p>粉絲群：477659567</p>
<hr />
<p>奶茶屋所有最新的【<a href="https://github.com/Nekomoekissaten/Nekomoekissaten-Subs" target="_blank" rel="external nofollow"><strong>外掛字幕</strong></a>】在這裡，如果有對本組做過的番有興趣的，歡迎來調 BD 軸！</p>
<p>本組發布的資源請以最新發布為準，最新的 TV 合集，最新的 BDRip 合集是最新修正的資源！</p>
<p>本組發布的外掛字幕請勿隨意修改後發布至公網！</p>
<p>點擊加入【<a href="https://jq.qq.com/?_wv=1027&amp;k=4ERTkKi" target="_blank" rel="external nofollow"><strong>奶茶分流小分隊</strong></a>】，為自己喜愛的番奉獻一份力量！</p>
<hr />
<p>從 2020 年 10 月新番起，本組發布的作品將去掉 Web 片源自帶的片頭！</p>]]></description>
<enclosure url="magnet:?xt=urn:btih:34XUFCWJNQKMETEAIBZ5OQT7J5VTBKQ6&amp;dn=&amp;tr=http%3A%2F%2F104.143.10.186%3A8000%2Fannounce&amp;tr=udp%3A%2F%2F104.143.10.186%3A8000%2Fannounce&amp;tr=http%3A%2F%2Ftracker.openbittorrent.com%3A80%2Fannounce&amp;tr=http%3A%2F%2Ftracker3.itzmx.com%3A6961%2Fannounce&amp;tr=http%3A%2F%2Ftracker4.itzmx.com%3A2710%2Fannounce&amp;tr=http%3A%2F%2Ftracker.publicbt.com%3A80%2Fannounce&amp;tr=http%3A%2F%2Ftracker.prq.to%2Fannounce&amp;tr=http%3A%2F%2Fopen.acgtracker.com%3A1096%2Fannounce&amp;tr=https%3A%2F%2Ft-115.rhcloud.com%2Fonly_for_ylbud&amp;tr=http%3A%2F%2Ftracker1.itzmx.com%3A8080%2Fannounce&amp;tr=http%3A%2F%2Ftracker2.itzmx.com%3A6961%2Fannounce&amp;tr=udp%3A%2F%2Ftracker1.itzmx.com%3A8080%2Fannounce&amp;tr=udp%3A%2F%2Ftracker2.itzmx.com%3A6961%2Fannounce&amp;tr=udp%3A%2F%2Ftracker3.itzmx.com%3A6961%2Fannounce&amp;tr=udp%3A%2F%2Ftracker4.itzmx.com%3A2710%2Fannounce&amp;tr=http%3A%2F%2Fnyaa.tracker.wf%3A7777%2Fannounce&amp;tr=http%3A%2F%2Ft.nyaatracker.com%2Fannounce&amp;tr=http%3A%2F%2Ft.acg.rip%3A6699%2Fannounce&amp;tr=http%3A%2F%2Ftr.bangumi.moe%3A6969%2Fannounce&amp;tr=http%3A%2F%2Fshare.camoe.cn%3A8080%2Fannounce&amp;tr=http%3A%2F%2Fsukebei.tracker.wf%3A8888%2Fannounce&amp;tr=http%3A%2F%2Fopenbittorrent.com%3A80%2Fannounce&amp;tr=https%3A%2F%2Fopentracker.i2p.rocks%3A443%2Fannounce&amp;tr=https%3A%2F%2Ftracker.nanoha.org%3A443%2Fannounce&amp;tr=https%3A%2F%2Ftracker.cyber-hub.net%3A443%2Fannounce&amp;tr=https%3A%2F%2Ftr.burnabyhighstar.com%3A443%2Fannounce"  length="1"  type="application/x-bittorrent" ></enclosure>
<author><![CDATA[nekomoekissaten]]></author>
<guid isPermaLink="true" >http://share.dmhy.org/topics/view/656439_10_Sousou_no_Frieren_10_1080p_v2.html</guid>
<category domain="http://share.dmhy.org/topics/list/sort_id/2" ><![CDATA[動畫]]></category>
</item>
<item>
<title><![CDATA[【喵萌奶茶屋】★10月新番★[葬送的芙莉莲 / Sousou no Frieren][10][1080p][简日双语][v2][招募翻译]]]></title>
<link>http://share.dmhy.org/topics/view/656437_10_Sousou_no_Frieren_10_1080p_v2.html</link>
<pubDate>Thu, 16 Nov 2023 19:04:51 +0800</pubDate>
<description><![CDATA[<p><img src="https://s2.loli.net/2023/10/04/2YE8DWOANHUxJKf.png" /></p>
<hr />
<p><img src="https://nekomoe.pages.dev/images/mainVisual/char.jpg" /></p>
<hr />
<p>喵萌奶茶屋招募以下职位的小伙伴！</p>
<p>1.<strong>翻译</strong>：没有证书要求，能正确听译一集动画即可</p>
<p>2.<strong>时轴</strong>：使用 Aegisub 准确拉轴对帧并设置合适的样式、字体、屏幕字</p>
<p>3.<strong>后期</strong>：懂时轴基础知识并使用 Vapoursynth 或 Avisynth 内嵌字幕，做种发布分流</p>
<p>4.<strong>压制</strong>：能独立写代码优化画质并使用 VapourSynth 或 AviSynth 压制 BDRip / DVDRip</p>
<p>5.<strong>特效</strong>：熟练应用特效代码制作合适的歌词特效</p>
<p>6.<strong>画师</strong>：画海报、字幕娘、表情包、LOGO 等</p>
<p>7.<strong>分流</strong>：捐献服务器盒子永久保种本组合集资源</p>
<p>欢迎热爱二次元热衷字幕制作的小伙伴加入！申请请加入 QQ 群：421320480</p>
<p>粉丝群：477659567</p>
<hr />
<p>奶茶屋所有最新的【<a href="https://github.com/Nekomoekissaten/Nekomoekissaten-Subs" target="_blank" rel="external nofollow"><strong>外挂字幕</strong></a>】在这里，如果有对本组做过的番有兴趣的，欢迎来调 BD 轴！</p>
<p>本组发布的资源请以最新发布为准，最新的 TV 合集，最新的 BDRip 合集是最新修正的资源！</p>
<p>本组发布的外挂字幕请勿随意修改后发布至公网！</p>
<p>点击加入【<a href="https://jq.qq.com/?_wv=1027&amp;k=4ERTkKi" target="_blank" rel="external nofollow"><strong>奶茶分流小分队</strong></a>】，为自己喜爱的番奉献一份力量！</p>
<hr />
<p>从 2020 年 10 月新番起，本组发布的作品将去掉 Web 片源自带的片头！</p>]]></description>
<enclosure url="magnet:?xt=urn:btih:HUCJG5CSBS4D3DC7KTDT5ZRJ2KFBSZFQ&amp;dn=&amp;tr=http%3A%2F%2F104.143.10.186%3A8000%2Fannounce&amp;tr=udp%3A%2F%2F104.143.10.186%3A8000%2Fannounce&amp;tr=http%3A%2F%2Ftracker.openbittorrent.com%3A80%2Fannounce&amp;tr=http%3A%2F%2Ftracker3.itzmx.com%3A6961%2Fannounce&amp;tr=http%3A%2F%2Ftracker4.itzmx.com%3A2710%2Fannounce&amp;tr=http%3A%2F%2Ftracker.publicbt.com%3A80%2Fannounce&amp;tr=http%3A%2F%2Ftracker.prq.to%2Fannounce&amp;tr=http%3A%2F%2Fopen.acgtracker.com%3A1096%2Fannounce&amp;tr=https%3A%2F%2Ft-115.rhcloud.com%2Fonly_for_ylbud&amp;tr=http%3A%2F%2Ftracker1.itzmx.com%3A8080%2Fannounce&amp;tr=http%3A%2F%2Ftracker2.itzmx.com%3A6961%2Fannounce&amp;tr=udp%3A%2F%2Ftracker1.itzmx.com%3A8080%2Fannounce&amp;tr=udp%3A%2F%2Ftracker2.itzmx.com%3A6961%2Fannounce&amp;tr=udp%3A%2F%2Ftracker3.itzmx.com%3A6961%2Fannounce&amp;tr=udp%3A%2F%2Ftracker4.itzmx.com%3A2710%2Fannounce&amp;tr=http%3A%2F%2Fnyaa.tracker.wf%3A7777%2Fannounce&amp;tr=http%3A%2F%2Ft.nyaatracker.com%2Fannounce&amp;tr=http%3A%2F%2Ft.acg.rip%3A6699%2Fannounce&amp;tr=http%3A%2F%2Ftr.bangumi.moe%3A6969%2Fannounce&amp;tr=http%3A%2F%2Fshare.camoe.cn%3A8080%2Fannounce&amp;tr=http%3A%2F%2Fsukebei.tracker.wf%3A8888%2Fannounce&amp;tr=http%3A%2F%2Fopenbittorrent.com%3A80%2Fannounce&amp;tr=https%3A%2F%2Fopentracker.i2p.rocks%3A443%2Fannounce&amp;tr=https%3A%2F%2Ftracker.nanoha.org%3A443%2Fannounce&amp;tr=https%3A%2F%2Ftracker.cyber-hub.net%3A443%2Fannounce&amp;tr=https%3A%2F%2Ftr.burnabyhighstar.com%3A443%2Fannounce"  length="1"  type="application/x-bittorrent" ></enclosure>
<author><![CDATA[nekomoekissaten]]></author>
<guid isPermaLink="true" >http://share.dmhy.org/topics/view/656437_10_Sousou_no_Frieren_10_1080p_v2.html</guid>
<category domain="http://share.dmhy.org/topics/list/sort_id/2" ><![CDATA[動畫]]></category>
</item>
<item>
<title><![CDATA[【喵萌奶茶屋】★10月新番★[葬送的芙莉蓮 / Sousou no Frieren][10][1080p][繁日雙語][招募翻譯]]]></title>
<link>http://share.dmhy.org/topics/view/656376_10_Sousou_no_Frieren_10_1080p.html</link>
<pubDate>Wed, 15 Nov 2023 22:49:17 +0800</pubDate>
<description><![CDATA[<p><img src="https://s2.loli.net/2023/10/04/2YE8DWOANHUxJKf.png" /></p>
<hr />
<p><img src="https://nekomoe.pages.dev/images/mainVisual/char.jpg" /></p>
<hr />
<p>喵萌奶茶屋招募以下職位的小伙伴！</p>
<p>1.<strong>翻譯</strong>：沒有證書要求，能正確聽譯一集動畫即可</p>
<p>2.<strong>時軸</strong>：使用 Aegisub 準確拉軸對幀並設置合適的樣式、字體、螢幕字</p>
<p>3.<strong>後期</strong>：懂時軸基礎知識並使用 Vapoursynth 或 Avisynth 內嵌字幕，做種發布分流</p>
<p>4.<strong>壓制</strong>：能獨立寫程式碼最佳化畫質並使用 VapourSynth 或 AviSynth 壓製 BDRip / DVDRip</p>
<p>5.<strong>特效</strong>：熟練應用特效代碼製作合適的歌詞特效</p>
<p>6.<strong>畫師</strong>：畫海報、字幕娘、表情包、LOGO 等</p>
<p>7.<strong>分流</strong>：捐獻伺服器盒子永久保種本組合集資源</p>
<p>歡迎熱愛二次元熱衷字幕製作的小伙伴加入！申請請加入 QQ 群：421320480</p>
<p>粉絲群：477659567</p>
<hr />
<p>奶茶屋所有最新的【<a href="https://github.com/Nekomoekissaten/Nekomoekissaten-Subs" target="_blank" rel="external nofollow"><strong>外掛字幕</strong></a>】在這裡，如果有對本組做過的番有興趣的，歡迎來調 BD 軸！</p>
<p>本組發布的資源請以最新發布為準，最新的 TV 合集，最新的 BDRip 合集是最新修正的資源！</p>
<p>本組發布的外掛字幕請勿隨意修改後發布至公網！</p>
<p>點擊加入【<a href="https://jq.qq.com/?_wv=1027&amp;k=4ERTkKi" target="_blank" rel="external nofollow"><strong>奶茶分流小分隊</strong></a>】，為自己喜愛的番奉獻一份力量！</p>
<hr />
<p>從 2020 年 10 月新番起，本組發布的作品將去掉 Web 片源自帶的片頭！</p>]]></description>
<enclosure url="magnet:?xt=urn:btih:UOZ4WNIF5JOCMZF44KQHCW2QPVPTTUSO&amp;dn=&amp;tr=http%3A%2F%2F104.143.10.186%3A8000%2Fannounce&amp;tr=udp%3A%2F%2F104.143.10.186%3A8000%2Fannounce&amp;tr=http%3A%2F%2Ftracker.openbittorrent.com%3A80%2Fannounce&amp;tr=http%3A%2F%2Ftracker3.itzmx.com%3A6961%2Fannounce&amp;tr=http%3A%2F%2Ftracker4.itzmx.com%3A2710%2Fannounce&amp;tr=http%3A%2F%2Ftracker.publicbt.com%3A80%2Fannounce&amp;tr=http%3A%2F%2Ftracker.prq.to%2Fannounce&amp;tr=http%3A%2F%2Fopen.acgtracker.com%3A1096%2Fannounce&amp;tr=https%3A%2F%2Ft-115.rhcloud.com%2Fonly_for_ylbud&amp;tr=http%3A%2F%2Ftracker1.itzmx.com%3A8080%2Fannounce&amp;tr=http%3A%2F%2Ftracker2.itzmx.com%3A6961%2Fannounce&amp;tr=udp%3A%2F%2Ftracker1.itzmx.com%3A8080%2Fannounce&amp;tr=udp%3A%2F%2Ftracker2.itzmx.com%3A6961%2Fannounce&amp;tr=udp%3A%2F%2Ftracker3.itzmx.com%3A6961%2Fannounce&amp;tr=udp%3A%2F%2Ftracker4.itzmx.com%3A2710%2Fannounce&amp;tr=http%3A%2F%2Fnyaa.tracker.wf%3A7777%2Fannounce&amp;tr=http%3A%2F%2Ft.nyaatracker.com%2Fannounce&amp;tr=http%3A%2F%2Ft.acg.rip%3A6699%2Fannounce&amp;tr=http%3A%2F%2Ftr.bangumi.moe%3A6969%2Fannounce&amp;tr=http%3A%2F%2Fshare.camoe.cn%3A8080%2Fannounce&amp;tr=http%3A%2F%2Fsukebei.tracker.wf%3A8888%2Fannounce&amp;tr=http%3A%2F%2Fopenbittorrent.com%3A80%2Fannounce&amp;tr=https%3A%2F%2Fopentracker.i2p.rocks%3A443%2Fannounce&amp;tr=https%3A%2F%2Ftracker.nanoha.org%3A443%2Fannounce&amp;tr=https%3A%2F%2Ftracker.cyber-hub.net%3A443%2Fannounce&amp;tr=https%3A%2F%2Ftr.burnabyhighstar.com%3A443%2Fannounce"  length="1"  type="application/x-bittorrent" ></enclosure>
<author><![CDATA[nekomoekissaten]]></author>
<guid isPermaLink="true" >http://share.dmhy.org/topics/view/656376_10_Sousou_no_Frieren_10_1080p.html</guid>
<category domain="http://share.dmhy.org/topics/list/sort_id/2" ><![CDATA[動畫]]></category>
</item>
<item>
<title><![CDATA[【喵萌奶茶屋】★10月新番★[葬送的芙莉莲 / Sousou no Frieren][10][1080p][简日双语][招募翻译]]]></title>
<link>http://share.dmhy.org/topics/view/656374_10_Sousou_no_Frieren_10_1080p.html</link>
<pubDate>Wed, 15 Nov 2023 22:49:07 +0800</pubDate>
<description><![CDATA[<p><img src="https://s2.loli.net/2023/10/04/2YE8DWOANHUxJKf.png" /></p>
<hr />
<p><img src="https://nekomoe.pages.dev/images/mainVisual/char.jpg" /></p>
<hr />
<p>喵萌奶茶屋招募以下职位的小伙伴！</p>
<p>1.<strong>翻译</strong>：没有证书要求，能正确听译一集动画即可</p>
<p>2.<strong>时轴</strong>：使用 Aegisub 准确拉轴对帧并设置合适的样式、字体、屏幕字</p>
<p>3.<strong>后期</strong>：懂时轴基础知识并使用 Vapoursynth 或 Avisynth 内嵌字幕，做种发布分流</p>
<p>4.<strong>压制</strong>：能独立写代码优化画质并使用 VapourSynth 或 AviSynth 压制 BDRip / DVDRip</p>
<p>5.<strong>特效</strong>：熟练应用特效代码制作合适的歌词特效</p>
<p>6.<strong>画师</strong>：画海报、字幕娘、表情包、LOGO 等</p>
<p>7.<strong>分流</strong>：捐献服务器盒子永久保种本组合集资源</p>
<p>欢迎热爱二次元热衷字幕制作的小伙伴加入！申请请加入 QQ 群：421320480</p>
<p>粉丝群：477659567</p>
<hr />
<p>奶茶屋所有最新的【<a href="https://github.com/Nekomoekissaten/Nekomoekissaten-Subs" target="_blank" rel="external nofollow"><strong>外挂字幕</strong></a>】在这里，如果有对本组做过的番有兴趣的，欢迎来调 BD 轴！</p>
<p>本组发布的资源请以最新发布为准，最新的 TV 合集，最新的 BDRip 合集是最新修正的资源！</p>
<p>本组发布的外挂字幕请勿随意修改后发布至公网！</p>
<p>点击加入【<a href="https://jq.qq.com/?_wv=1027&amp;k=4ERTkKi" target="_blank" rel="external nofollow"><strong>奶茶分流小分队</strong></a>】，为自己喜爱的番奉献一份力量！</p>
<hr />
<p>从 2020 年 10 月新番起，本组发布的作品将去掉 Web 片源自带的片头！</p>]]></description>
<enclosure url="magnet:?xt=urn:btih:I4R7DVCYPGYKYVQNAN2GUTGM3HDYOUSZ&amp;dn=&amp;tr=http%3A%2F%2F104.143.10.186%3A8000%2Fannounce&amp;tr=udp%3A%2F%2F104.143.10.186%3A8000%2Fannounce&amp;tr=http%3A%2F%2Ftracker.openbittorrent.com%3A80%2Fannounce&amp;tr=http%3A%2F%2Ftracker3.itzmx.com%3A6961%2Fannounce&amp;tr=http%3A%2F%2Ftracker4.itzmx.com%3A2710%2Fannounce&amp;tr=http%3A%2F%2Ftracker.publicbt.com%3A80%2Fannounce&amp;tr=http%3A%2F%2Ftracker.prq.to%2Fannounce&amp;tr=http%3A%2F%2Fopen.acgtracker.com%3A1096%2Fannounce&amp;tr=https%3A%2F%2Ft-115.rhcloud.com%2Fonly_for_ylbud&amp;tr=http%3A%2F%2Ftracker1.itzmx.com%3A8080%2Fannounce&amp;tr=http%3A%2F%2Ftracker2.itzmx.com%3A6961%2Fannounce&amp;tr=udp%3A%2F%2Ftracker1.itzmx.com%3A8080%2Fannounce&amp;tr=udp%3A%2F%2Ftracker2.itzmx.com%3A6961%2Fannounce&amp;tr=udp%3A%2F%2Ftracker3.itzmx.com%3A6961%2Fannounce&amp;tr=udp%3A%2F%2Ftracker4.itzmx.com%3A2710%2Fannounce&amp;tr=http%3A%2F%2Fnyaa.tracker.wf%3A7777%2Fannounce&amp;tr=http%3A%2F%2Ft.nyaatracker.com%2Fannounce&amp;tr=http%3A%2F%2Ft.acg.rip%3A6699%2Fannounce&amp;tr=http%3A%2F%2Ftr.bangumi.moe%3A6969%2Fannounce&amp;tr=http%3A%2F%2Fshare.camoe.cn%3A8080%2Fannounce&amp;tr=http%3A%2F%2Fsukebei.tracker.wf%3A8888%2Fannounce&amp;tr=http%3A%2F%2Fopenbittorrent.com%3A80%2Fannounce&amp;tr=https%3A%2F%2Fopentracker.i2p.rocks%3A443%2Fannounce&amp;tr=https%3A%2F%2Ftracker.nanoha.org%3A443%2Fannounce&amp;tr=https%3A%2F%2Ftracker.cyber-hub.net%3A443%2Fannounce&amp;tr=https%3A%2F%2Ftr.burnabyhighstar.com%3A443%2Fannounce"  length="1"  type="application/x-bittorrent" ></enclosure>
<author><![CDATA[nekomoekissaten]]></author>
<guid isPermaLink="true" >http://share.dmhy.org/topics/view/656374_10_Sousou_no_Frieren_10_1080p.html</guid>
<category domain="http://share.dmhy.org/topics/list/sort_id/2" ><![CDATA[動畫]]></category>
</item>
<item>
<title><![CDATA[【喵萌奶茶屋】★10月新番★[葬送的芙莉蓮 / Sousou no Frieren][09][1080p][繁日雙語][招募翻譯]]]></title>
<link>http://share.dmhy.org/topics/view/655779_10_Sousou_no_Frieren_09_1080p.html</link>
<pubDate>Wed, 08 Nov 2023 08:27:40 +0800</pubDate>
<description><![CDATA[<p><img src="https://s2.loli.net/2023/10/04/2YE8DWOANHUxJKf.png" /></p>
<hr />
<p><img src="https://nekomoe.pages.dev/images/mainVisual/char.jpg" /></p>
<hr />
<p>喵萌奶茶屋招募以下職位的小伙伴！</p>
<p>1.<strong>翻譯</strong>：沒有證書要求，能正確聽譯一集動畫即可</p>
<p>2.<strong>時軸</strong>：使用 Aegisub 準確拉軸對幀並設置合適的樣式、字體、螢幕字</p>
<p>3.<strong>後期</strong>：懂時軸基礎知識並使用 Vapoursynth 或 Avisynth 內嵌字幕，做種發布分流</p>
<p>4.<strong>壓制</strong>：能獨立寫程式碼最佳化畫質並使用 VapourSynth 或 AviSynth 壓製 BDRip / DVDRip</p>
<p>5.<strong>特效</strong>：熟練應用特效代碼製作合適的歌詞特效</p>
<p>6.<strong>畫師</strong>：畫海報、字幕娘、表情包、LOGO 等</p>
<p>7.<strong>分流</strong>：捐獻伺服器盒子永久保種本組合集資源</p>
<p>歡迎熱愛二次元熱衷字幕製作的小伙伴加入！申請請加入 QQ 群：421320480</p>
<p>粉絲群：477659567</p>
<hr />
<p>奶茶屋所有最新的【<a href="https://github.com/Nekomoekissaten/Nekomoekissaten-Subs" target="_blank" rel="external nofollow"><strong>外掛字幕</strong></a>】在這裡，如果有對本組做過的番有興趣的，歡迎來調 BD 軸！</p>
<p>本組發布的資源請以最新發布為準，最新的 TV 合集，最新的 BDRip 合集是最新修正的資源！</p>
<p>本組發布的外掛字幕請勿隨意修改後發布至公網！</p>
<p>點擊加入【<a href="https://jq.qq.com/?_wv=1027&amp;k=4ERTkKi" target="_blank" rel="external nofollow"><strong>奶茶分流小分隊</strong></a>】，為自己喜愛的番奉獻一份力量！</p>
<hr />
<p>從 2020 年 10 月新番起，本組發布的作品將去掉 Web 片源自帶的片頭！</p>]]></description>
<enclosure url="magnet:?xt=urn:btih:4YZG3VYNLZVFRFTEVZ2Z262YCLVQFI6Y&amp;dn=&amp;tr=http%3A%2F%2F104.143.10.186%3A8000%2Fannounce&amp;tr=udp%3A%2F%2F104.143.10.186%3A8000%2Fannounce&amp;tr=http%3A%2F%2Ftracker.openbittorrent.com%3A80%2Fannounce&amp;tr=http%3A%2F%2Ftracker3.itzmx.com%3A6961%2Fannounce&amp;tr=http%3A%2F%2Ftracker4.itzmx.com%3A2710%2Fannounce&amp;tr=http%3A%2F%2Ftracker.publicbt.com%3A80%2Fannounce&amp;tr=http%3A%2F%2Ftracker.prq.to%2Fannounce&amp;tr=http%3A%2F%2Fopen.acgtracker.com%3A1096%2Fannounce&amp;tr=https%3A%2F%2Ft-115.rhcloud.com%2Fonly_for_ylbud&amp;tr=http%3A%2F%2Ftracker1.itzmx.com%3A8080%2Fannounce&amp;tr=http%3A%2F%2Ftracker2.itzmx.com%3A6961%2Fannounce&amp;tr=udp%3A%2F%2Ftracker1.itzmx.com%3A8080%2Fannounce&amp;tr=udp%3A%2F%2Ftracker2.itzmx.com%3A6961%2Fannounce&amp;tr=udp%3A%2F%2Ftracker3.itzmx.com%3A6961%2Fannounce&amp;tr=udp%3A%2F%2Ftracker4.itzmx.com%3A2710%2Fannounce&amp;tr=http%3A%2F%2Fnyaa.tracker.wf%3A7777%2Fannounce&amp;tr=http%3A%2F%2Ft.nyaatracker.com%2Fannounce&amp;tr=http%3A%2F%2Ft.acg.rip%3A6699%2Fannounce&amp;tr=http%3A%2F%2Ftr.bangumi.moe%3A6969%2Fannounce&amp;tr=http%3A%2F%2Fshare.camoe.cn%3A8080%2Fannounce&amp;tr=http%3A%2F%2Fsukebei.tracker.wf%3A8888%2Fannounce&amp;tr=http%3A%2F%2Fopenbittorrent.com%3A80%2Fannounce&amp;tr=https%3A%2F%2Fopentracker.i2p.rocks%3A443%2Fannounce&amp;tr=https%3A%2F%2Ftracker.nanoha.org%3A443%2Fannounce&amp;tr=https%3A%2F%2Ftracker.cyber-hub.net%3A443%2Fannounce&amp;tr=https%3A%2F%2Ftr.burnabyhighstar.com%3A443%2Fannounce"  length="1"  type="application/x-bittorrent" ></enclosure>
<author><![CDATA[nekomoekissaten]]></author>
<guid isPermaLink="true" >http://share.dmhy.org/topics/view/655779_10_Sousou_no_Frieren_09_1080p.html</guid>
<category domain="http://share.dmhy.org/topics/list/sort_id/2" ><![CDATA[動畫]]></category>
</item>
<item>
<title><![CDATA[【喵萌奶茶屋】★10月新番★[葬送的芙莉莲 / Sousou no Frieren][09][1080p][简日双语][招募翻译]]]></title>
<link>http://share.dmhy.org/topics/view/655778_10_Sousou_no_Frieren_09_1080p.html</link>
<pubDate>Wed, 08 Nov 2023 08:27:30 +0800</pubDate>
<description><![CDATA[<p><img src="https://s2.loli.net/2023/10/04/2YE8DWOANHUxJKf.png" /></p>
<hr />
<p><img src="https://nekomoe.pages.dev/images/mainVisual/char.jpg" /></p>
<hr />
<p>喵萌奶茶屋招募以下职位的小伙伴！</p>
<p>1.<strong>翻译</strong>：没有证书要求，能正确听译一集动画即可</p>
<p>2.<strong>时轴</strong>：使用 Aegisub 准确拉轴对帧并设置合适的样式、字体、屏幕字</p>
<p>3.<strong>后期</strong>：懂时轴基础知识并使用 Vapoursynth 或 Avisynth 内嵌字幕，做种发布分流</p>
<p>4.<strong>压制</strong>：能独立写代码优化画质并使用 VapourSynth 或 AviSynth 压制 BDRip / DVDRip</p>
<p>5.<strong>特效</strong>：熟练应用特效代码制作合适的歌词特效</p>
<p>6.<strong>画师</strong>：画海报、字幕娘、表情包、LOGO 等</p>
<p>7.<strong>分流</strong>：捐献服务器盒子永久保种本组合集资源</p>
<p>欢迎热爱二次元热衷字幕制作的小伙伴加入！申请请加入 QQ 群：421320480</p>
<p>粉丝群：477659567</p>
<hr />
<p>奶茶屋所有最新的【<a href="https://github.com/Nekomoekissaten/Nekomoekissaten-Subs" target="_blank" rel="external nofollow"><strong>外挂字幕</strong></a>】在这里，如果有对本组做过的番有兴趣的，欢迎来调 BD 轴！</p>
<p>本组发布的资源请以最新发布为准，最新的 TV 合集，最新的 BDRip 合集是最新修正的资源！</p>
<p>本组发布的外挂字幕请勿随意修改后发布至公网！</p>
<p>点击加入【<a href="https://jq.qq.com/?_wv=1027&amp;k=4ERTkKi" target="_blank" rel="external nofollow"><strong>奶茶分流小分队</strong></a>】，为自己喜爱的番奉献一份力量！</p>
<hr />
<p>从 2020 年 10 月新番起，本组发布的作品将去掉 Web 片源自带的片头！</p>]]></description>
<enclosure url="magnet:?xt=urn:btih:WRTL5GZDE4VO54WHJ3PU2DGNWJRW7FLT&amp;dn=&amp;tr=http%3A%2F%2F104.143.10.186%3A8000%2Fannounce&amp;tr=udp%3A%2F%2F104.143.10.186%3A8000%2Fannounce&amp;tr=http%3A%2F%2Ftracker.openbittorrent.com%3A80%2Fannounce&amp;tr=http%3A%2F%2Ftracker3.itzmx.com%3A6961%2Fannounce&amp;tr=http%3A%2F%2Ftracker4.itzmx.com%3A2710%2Fannounce&amp;tr=http%3A%2F%2Ftracker.publicbt.com%3A80%2Fannounce&amp;tr=http%3A%2F%2Ftracker.prq.to%2Fannounce&amp;tr=http%3A%2F%2Fopen.acgtracker.com%3A1096%2Fannounce&amp;tr=https%3A%2F%2Ft-115.rhcloud.com%2Fonly_for_ylbud&amp;tr=http%3A%2F%2Ftracker1.itzmx.com%3A8080%2Fannounce&amp;tr=http%3A%2F%2Ftracker2.itzmx.com%3A6961%2Fannounce&amp;tr=udp%3A%2F%2Ftracker1.itzmx.com%3A8080%2Fannounce&amp;tr=udp%3A%2F%2Ftracker2.itzmx.com%3A6961%2Fannounce&amp;tr=udp%3A%2F%2Ftracker3.itzmx.com%3A6961%2Fannounce&amp;tr=udp%3A%2F%2Ftracker4.itzmx.com%3A2710%2Fannounce&amp;tr=http%3A%2F%2Fnyaa.tracker.wf%3A7777%2Fannounce&amp;tr=http%3A%2F%2Ft.nyaatracker.com%2Fannounce&amp;tr=http%3A%2F%2Ft.acg.rip%3A6699%2Fannounce&amp;tr=http%3A%2F%2Ftr.bangumi.moe%3A6969%2Fannounce&amp;tr=http%3A%2F%2Fshare.camoe.cn%3A8080%2Fannounce&amp;tr=http%3A%2F%2Fsukebei.tracker.wf%3A8888%2Fannounce&amp;tr=http%3A%2F%2Fopenbittorrent.com%3A80%2Fannounce&amp;tr=https%3A%2F%2Fopentracker.i2p.rocks%3A443%2Fannounce&amp;tr=https%3A%2F%2Ftracker.nanoha.org%3A443%2Fannounce&amp;tr=https%3A%2F%2Ftracker.cyber-hub.net%3A443%2Fannounce&amp;tr=https%3A%2F%2Ftr.burnabyhighstar.com%3A443%2Fannounce"  length="1"  type="application/x-bittorrent" ></enclosure>
<author><![CDATA[nekomoekissaten]]></author>
<guid isPermaLink="true" >http://share.dmhy.org/topics/view/655778_10_Sousou_no_Frieren_09_1080p.html</guid>
<category domain="http://share.dmhy.org/topics/list/sort_id/2" ><![CDATA[動畫]]></category>
</item>
<item>
<title><![CDATA[【喵萌奶茶屋】★10月新番★[葬送的芙莉蓮 / Sousou no Frieren][08][1080p][繁日雙語][招募翻譯]]]></title>
<link>http://share.dmhy.org/topics/view/655212_10_Sousou_no_Frieren_08_1080p.html</link>
<pubDate>Mon, 30 Oct 2023 23:18:36 +0800</pubDate>
<description><![CDATA[<p><img src="https://s2.loli.net/2023/10/04/2YE8DWOANHUxJKf.png" /></p>
<hr />
<p><img src="https://nekomoe.pages.dev/images/mainVisual/char.jpg" /></p>
<hr />
<p>喵萌奶茶屋招募以下職位的小伙伴！</p>
<p>1.<strong>翻譯</strong>：沒有證書要求，能正確聽譯一集動畫即可</p>
<p>2.<strong>時軸</strong>：使用 Aegisub 準確拉軸對幀並設置合適的樣式、字體、螢幕字</p>
<p>3.<strong>後期</strong>：懂時軸基礎知識並使用 Vapoursynth 或 Avisynth 內嵌字幕，做種發布分流</p>
<p>4.<strong>壓制</strong>：能獨立寫程式碼最佳化畫質並使用 VapourSynth 或 AviSynth 壓製 BDRip / DVDRip</p>
<p>5.<strong>特效</strong>：熟練應用特效代碼製作合適的歌詞特效</p>
<p>6.<strong>畫師</strong>：畫海報、字幕娘、表情包、LOGO 等</p>
<p>7.<strong>分流</strong>：捐獻伺服器盒子永久保種本組合集資源</p>
<p>歡迎熱愛二次元熱衷字幕製作的小伙伴加入！申請請加入 QQ 群：421320480</p>
<p>粉絲群：477659567</p>
<hr />
<p>奶茶屋所有最新的【<a href="https://github.com/Nekomoekissaten/Nekomoekissaten-Subs" target="_blank" rel="external nofollow"><strong>外掛字幕</strong></a>】在這裡，如果有對本組做過的番有興趣的，歡迎來調 BD 軸！</p>
<p>本組發布的資源請以最新發布為準，最新的 TV 合集，最新的 BDRip 合集是最新修正的資源！</p>
<p>本組發布的外掛字幕請勿隨意修改後發布至公網！</p>
<p>點擊加入【<a href="https://jq.qq.com/?_wv=1027&amp;k=4ERTkKi" target="_blank" rel="external nofollow"><strong>奶茶分流小分隊</strong></a>】，為自己喜愛的番奉獻一份力量！</p>
<hr />
<p>從 2020 年 10 月新番起，本組發布的作品將去掉 Web 片源自帶的片頭！</p>]]></description>
<enclosure url="magnet:?xt=urn:btih:5C6BF7O2SAKLUZ6PQYCRAPO5I4ZGMVY6&amp;dn=&amp;tr=http%3A%2F%2F104.143.10.186%3A8000%2Fannounce&amp;tr=udp%3A%2F%2F104.143.10.186%3A8000%2Fannounce&amp;tr=http%3A%2F%2Ftracker.openbittorrent.com%3A80%2Fannounce&amp;tr=http%3A%2F%2Ftracker3.itzmx.com%3A6961%2Fannounce&amp;tr=http%3A%2F%2Ftracker4.itzmx.com%3A2710%2Fannounce&amp;tr=http%3A%2F%2Ftracker.publicbt.com%3A80%2Fannounce&amp;tr=http%3A%2F%2Ftracker.prq.to%2Fannounce&amp;tr=http%3A%2F%2Fopen.acgtracker.com%3A1096%2Fannounce&amp;tr=https%3A%2F%2Ft-115.rhcloud.com%2Fonly_for_ylbud&amp;tr=http%3A%2F%2Ftracker1.itzmx.com%3A8080%2Fannounce&amp;tr=http%3A%2F%2Ftracker2.itzmx.com%3A6961%2Fannounce&amp;tr=udp%3A%2F%2Ftracker1.itzmx.com%3A8080%2Fannounce&amp;tr=udp%3A%2F%2Ftracker2.itzmx.com%3A6961%2Fannounce&amp;tr=udp%3A%2F%2Ftracker3.itzmx.com%3A6961%2Fannounce&amp;tr=udp%3A%2F%2Ftracker4.itzmx.com%3A2710%2Fannounce&amp;tr=http%3A%2F%2Fnyaa.tracker.wf%3A7777%2Fannounce&amp;tr=http%3A%2F%2Ft.nyaatracker.com%2Fannounce&amp;tr=http%3A%2F%2Ft.acg.rip%3A6699%2Fannounce&amp;tr=http%3A%2F%2Ftr.bangumi.moe%3A6969%2Fannounce&amp;tr=http%3A%2F%2Fshare.camoe.cn%3A8080%2Fannounce&amp;tr=http%3A%2F%2Fsukebei.tracker.wf%3A8888%2Fannounce&amp;tr=http%3A%2F%2Fopenbittorrent.com%3A80%2Fannounce&amp;tr=https%3A%2F%2Fopentracker.i2p.rocks%3A443%2Fannounce&amp;tr=https%3A%2F%2Ftracker.nanoha.org%3A443%2Fannounce&amp;tr=https%3A%2F%2Ftracker.cyber-hub.net%3A443%2Fannounce&amp;tr=https%3A%2F%2Ftr.burnabyhighstar.com%3A443%2Fannounce"  length="1"  type="application/x-bittorrent" ></enclosure>
<author><![CDATA[nekomoekissaten]]></author>
<guid isPermaLink="true" >http://share.dmhy.org/topics/view/655212_10_Sousou_no_Frieren_08_1080p.html</guid>
<category domain="http://share.dmhy.org/topics/list/sort_id/2" ><![CDATA[動畫]]></category>
</item>
<item>
<title><![CDATA[【喵萌奶茶屋】★10月新番★[葬送的芙莉莲 / Sousou no Frieren][08][1080p][简日双语][招募翻译]]]></title>
<link>http://share.dmhy.org/topics/view/655211_10_Sousou_no_Frieren_08_1080p.html</link>
<pubDate>Mon, 30 Oct 2023 23:18:26 +0800</pubDate>
<description><![CDATA[<p><img src="https://s2.loli.net/2023/10/04/2YE8DWOANHUxJKf.png" /></p>
<hr />
<p><img src="https://nekomoe.pages.dev/images/mainVisual/char.jpg" /></p>
<hr />
<p>喵萌奶茶屋招募以下职位的小伙伴！</p>
<p>1.<strong>翻译</strong>：没有证书要求，能正确听译一集动画即可</p>
<p>2.<strong>时轴</strong>：使用 Aegisub 准确拉轴对帧并设置合适的样式、字体、屏幕字</p>
<p>3.<strong>后期</strong>：懂时轴基础知识并使用 Vapoursynth 或 Avisynth 内嵌字幕，做种发布分流</p>
<p>4.<strong>压制</strong>：能独立写代码优化画质并使用 VapourSynth 或 AviSynth 压制 BDRip / DVDRip</p>
<p>5.<strong>特效</strong>：熟练应用特效代码制作合适的歌词特效</p>
<p>6.<strong>画师</strong>：画海报、字幕娘、表情包、LOGO 等</p>
<p>7.<strong>分流</strong>：捐献服务器盒子永久保种本组合集资源</p>
<p>欢迎热爱二次元热衷字幕制作的小伙伴加入！申请请加入 QQ 群：421320480</p>
<p>粉丝群：477659567</p>
<hr />
<p>奶茶屋所有最新的【<a href="https://github.com/Nekomoekissaten/Nekomoekissaten-Subs" target="_blank" rel="external nofollow"><strong>外挂字幕</strong></a>】在这里，如果有对本组做过的番有兴趣的，欢迎来调 BD 轴！</p>
<p>本组发布的资源请以最新发布为准，最新的 TV 合集，最新的 BDRip 合集是最新修正的资源！</p>
<p>本组发布的外挂字幕请勿随意修改后发布至公网！</p>
<p>点击加入【<a href="https://jq.qq.com/?_wv=1027&amp;k=4ERTkKi" target="_blank" rel="external nofollow"><strong>奶茶分流小分队</strong></a>】，为自己喜爱的番奉献一份力量！</p>
<hr />
<p>从 2020 年 10 月新番起，本组发布的作品将去掉 Web 片源自带的片头！</p>]]></description>
<enclosure url="magnet:?xt=urn:btih:JYCW5VSIJUOI5F6NEB3TLPORI4MNARHW&amp;dn=&amp;tr=http%3A%2F%2F104.143.10.186%3A8000%2Fannounce&amp;tr=udp%3A%2F%2F104.143.10.186%3A8000%2Fannounce&amp;tr=http%3A%2F%2Ftracker.openbittorrent.com%3A80%2Fannounce&amp;tr=http%3A%2F%2Ftracker3.itzmx.com%3A6961%2Fannounce&amp;tr=http%3A%2F%2Ftracker4.itzmx.com%3A2710%2Fannounce&amp;tr=http%3A%2F%2Ftracker.publicbt.com%3A80%2Fannounce&amp;tr=http%3A%2F%2Ftracker.prq.to%2Fannounce&amp;tr=http%3A%2F%2Fopen.acgtracker.com%3A1096%2Fannounce&amp;tr=https%3A%2F%2Ft-115.rhcloud.com%2Fonly_for_ylbud&amp;tr=http%3A%2F%2Ftracker1.itzmx.com%3A8080%2Fannounce&amp;tr=http%3A%2F%2Ftracker2.itzmx.com%3A6961%2Fannounce&amp;tr=udp%3A%2F%2Ftracker1.itzmx.com%3A8080%2Fannounce&amp;tr=udp%3A%2F%2Ftracker2.itzmx.com%3A6961%2Fannounce&amp;tr=udp%3A%2F%2Ftracker3.itzmx.com%3A6961%2Fannounce&amp;tr=udp%3A%2F%2Ftracker4.itzmx.com%3A2710%2Fannounce&amp;tr=http%3A%2F%2Fnyaa.tracker.wf%3A7777%2Fannounce&amp;tr=http%3A%2F%2Ft.nyaatracker.com%2Fannounce&amp;tr=http%3A%2F%2Ft.acg.rip%3A6699%2Fannounce&amp;tr=http%3A%2F%2Ftr.bangumi.moe%3A6969%2Fannounce&amp;tr=http%3A%2F%2Fshare.camoe.cn%3A8080%2Fannounce&amp;tr=http%3A%2F%2Fsukebei.tracker.wf%3A8888%2Fannounce&amp;tr=http%3A%2F%2Fopenbittorrent.com%3A80%2Fannounce&amp;tr=https%3A%2F%2Fopentracker.i2p.rocks%3A443%2Fannounce&amp;tr=https%3A%2F%2Ftracker.nanoha.org%3A443%2Fannounce&amp;tr=https%3A%2F%2Ftracker.cyber-hub.net%3A443%2Fannounce&amp;tr=https%3A%2F%2Ftr.burnabyhighstar.com%3A443%2Fannounce"  length="1"  type="application/x-bittorrent" ></enclosure>
<author><![CDATA[nekomoekissaten]]></author>
<guid isPermaLink="true" >http://share.dmhy.org/topics/view/655211_10_Sousou_no_Frieren_08_1080p.html</guid>
<category domain="http://share.dmhy.org/topics/list/sort_id/2" ><![CDATA[動畫]]></category>
</item>
<item>
<title><![CDATA[【喵萌奶茶屋】★10月新番★[葬送的芙莉蓮 / Sousou no Frieren][07][1080p][繁日雙語][招募翻譯]]]></title>
<link>http://share.dmhy.org/topics/view/654544_10_Sousou_no_Frieren_07_1080p.html</link>
<pubDate>Tue, 24 Oct 2023 08:02:27 +0800</pubDate>
<description><![CDATA[<p><img src="https://s2.loli.net/2023/10/04/2YE8DWOANHUxJKf.png" /></p>
<hr />
<p><img src="https://nekomoe.pages.dev/images/mainVisual/char.jpg" /></p>
<hr />
<p>喵萌奶茶屋招募以下職位的小伙伴！</p>
<p>1.<strong>翻譯</strong>：沒有證書要求，能正確聽譯一集動畫即可</p>
<p>2.<strong>時軸</strong>：使用 Aegisub 準確拉軸對幀並設置合適的樣式、字體、螢幕字</p>
<p>3.<strong>後期</strong>：懂時軸基礎知識並使用 Vapoursynth 或 Avisynth 內嵌字幕，做種發布分流</p>
<p>4.<strong>壓制</strong>：能獨立寫程式碼最佳化畫質並使用 VapourSynth 或 AviSynth 壓製 BDRip / DVDRip</p>
<p>5.<strong>特效</strong>：熟練應用特效代碼製作合適的歌詞特效</p>
<p>6.<strong>畫師</strong>：畫海報、字幕娘、表情包、LOGO 等</p>
<p>7.<strong>分流</strong>：捐獻伺服器盒子永久保種本組合集資源</p>
<p>歡迎熱愛二次元熱衷字幕製作的小伙伴加入！申請請加入 QQ 群：421320480</p>
<p>粉絲群：477659567</p>
<hr />
<p>奶茶屋所有最新的【<a href="https://github.com/Nekomoekissaten/Nekomoekissaten-Subs" target="_blank" rel="external nofollow"><strong>外掛字幕</strong></a>】在這裡，如果有對本組做過的番有興趣的，歡迎來調 BD 軸！</p>
<p>本組發布的資源請以最新發布為準，最新的 TV 合集，最新的 BDRip 合集是最新修正的資源！</p>
<p>本組發布的外掛字幕請勿隨意修改後發布至公網！</p>
<p>點擊加入【<a href="https://jq.qq.com/?_wv=1027&amp;k=4ERTkKi" target="_blank" rel="external nofollow"><strong>奶茶分流小分隊</strong></a>】，為自己喜愛的番奉獻一份力量！</p>
<hr />
<p>從 2020 年 10 月新番起，本組發布的作品將去掉 Web 片源自帶的片頭！</p>]]></description>
<enclosure url="magnet:?xt=urn:btih:MDTCJMKDXZG6KMA75DNEEUNH34FDT2HQ&amp;dn=&amp;tr=http%3A%2F%2F104.143.10.186%3A8000%2Fannounce&amp;tr=udp%3A%2F%2F104.143.10.186%3A8000%2Fannounce&amp;tr=http%3A%2F%2Ftracker.openbittorrent.com%3A80%2Fannounce&amp;tr=http%3A%2F%2Ftracker3.itzmx.com%3A6961%2Fannounce&amp;tr=http%3A%2F%2Ftracker4.itzmx.com%3A2710%2Fannounce&amp;tr=http%3A%2F%2Ftracker.publicbt.com%3A80%2Fannounce&amp;tr=http%3A%2F%2Ftracker.prq.to%2Fannounce&amp;tr=http%3A%2F%2Fopen.acgtracker.com%3A1096%2Fannounce&amp;tr=https%3A%2F%2Ft-115.rhcloud.com%2Fonly_for_ylbud&amp;tr=http%3A%2F%2Ftracker1.itzmx.com%3A8080%2Fannounce&amp;tr=http%3A%2F%2Ftracker2.itzmx.com%3A6961%2Fannounce&amp;tr=udp%3A%2F%2Ftracker1.itzmx.com%3A8080%2Fannounce&amp;tr=udp%3A%2F%2Ftracker2.itzmx.com%3A6961%2Fannounce&amp;tr=udp%3A%2F%2Ftracker3.itzmx.com%3A6961%2Fannounce&amp;tr=udp%3A%2F%2Ftracker4.itzmx.com%3A2710%2Fannounce&amp;tr=http%3A%2F%2Fnyaa.tracker.wf%3A7777%2Fannounce&amp;tr=http%3A%2F%2Ft.nyaatracker.com%2Fannounce&amp;tr=http%3A%2F%2Ft.acg.rip%3A6699%2Fannounce&amp;tr=http%3A%2F%2Ftr.bangumi.moe%3A6969%2Fannounce&amp;tr=http%3A%2F%2Fshare.camoe.cn%3A8080%2Fannounce&amp;tr=http%3A%2F%2Fsukebei.tracker.wf%3A8888%2Fannounce&amp;tr=http%3A%2F%2Fopenbittorrent.com%3A80%2Fannounce&amp;tr=https%3A%2F%2Fopentracker.i2p.rocks%3A443%2Fannounce&amp;tr=https%3A%2F%2Ftracker.nanoha.org%3A443%2Fannounce&amp;tr=https%3A%2F%2Ftracker.cyber-hub.net%3A443%2Fannounce&amp;tr=https%3A%2F%2Ftr.burnabyhighstar.com%3A443%2Fannounce"  length="1"  type="application/x-bittorrent" ></enclosure>
<author><![CDATA[nekomoekissaten]]></author>
<guid isPermaLink="true" >http://share.dmhy.org/topics/view/654544_10_Sousou_no_Frieren_07_1080p.html</guid>
<category domain="http://share.dmhy.org/topics/list/sort_id/2" ><![CDATA[動畫]]></category>
</item>
<item>
<title><![CDATA[【喵萌奶茶屋】★10月新番★[葬送的芙莉莲 / Sousou no Frieren][07][1080p][简日双语][招募翻译]]]></title>
<link>http://share.dmhy.org/topics/view/654543_10_Sousou_no_Frieren_07_1080p.html</link>
<pubDate>Tue, 24 Oct 2023 08:02:18 +0800</pubDate>
<description><![CDATA[<p><img src="https://s2.loli.net/2023/10/04/2YE8DWOANHUxJKf.png" /></p>
<hr />
<p><img src="https://nekomoe.pages.dev/images/mainVisual/char.jpg" /></p>
<hr />
<p>喵萌奶茶屋招募以下职位的小伙伴！</p>
<p>1.<strong>翻译</strong>：没有证书要求，能正确听译一集动画即可</p>
<p>2.<strong>时轴</strong>：使用 Aegisub 准确拉轴对帧并设置合适的样式、字体、屏幕字</p>
<p>3.<strong>后期</strong>：懂时轴基础知识并使用 Vapoursynth 或 Avisynth 内嵌字幕，做种发布分流</p>
<p>4.<strong>压制</strong>：能独立写代码优化画质并使用 VapourSynth 或 AviSynth 压制 BDRip / DVDRip</p>
<p>5.<strong>特效</strong>：熟练应用特效代码制作合适的歌词特效</p>
<p>6.<strong>画师</strong>：画海报、字幕娘、表情包、LOGO 等</p>
<p>7.<strong>分流</strong>：捐献服务器盒子永久保种本组合集资源</p>
<p>欢迎热爱二次元热衷字幕制作的小伙伴加入！申请请加入 QQ 群：421320480</p>
<p>粉丝群：477659567</p>
<hr />
<p>奶茶屋所有最新的【<a href="https://github.com/Nekomoekissaten/Nekomoekissaten-Subs" target="_blank" rel="external nofollow"><strong>外挂字幕</strong></a>】在这里，如果有对本组做过的番有兴趣的，欢迎来调 BD 轴！</p>
<p>本组发布的资源请以最新发布为准，最新的 TV 合集，最新的 BDRip 合集是最新修正的资源！</p>
<p>本组发布的外挂字幕请勿随意修改后发布至公网！</p>
<p>点击加入【<a href="https://jq.qq.com/?_wv=1027&amp;k=4ERTkKi" target="_blank" rel="external nofollow"><strong>奶茶分流小分队</strong></a>】，为自己喜爱的番奉献一份力量！</p>
<hr />
<p>从 2020 年 10 月新番起，本组发布的作品将去掉 Web 片源自带的片头！</p>]]></description>
<enclosure url="magnet:?xt=urn:btih:KSP7ZQKLYOBRODIADINOTASCGEVFXD36&amp;dn=&amp;tr=http%3A%2F%2F104.143.10.186%3A8000%2Fannounce&amp;tr=udp%3A%2F%2F104.143.10.186%3A8000%2Fannounce&amp;tr=http%3A%2F%2Ftracker.openbittorrent.com%3A80%2Fannounce&amp;tr=http%3A%2F%2Ftracker3.itzmx.com%3A6961%2Fannounce&amp;tr=http%3A%2F%2Ftracker4.itzmx.com%3A2710%2Fannounce&amp;tr=http%3A%2F%2Ftracker.publicbt.com%3A80%2Fannounce&amp;tr=http%3A%2F%2Ftracker.prq.to%2Fannounce&amp;tr=http%3A%2F%2Fopen.acgtracker.com%3A1096%2Fannounce&amp;tr=https%3A%2F%2Ft-115.rhcloud.com%2Fonly_for_ylbud&amp;tr=http%3A%2F%2Ftracker1.itzmx.com%3A8080%2Fannounce&amp;tr=http%3A%2F%2Ftracker2.itzmx.com%3A6961%2Fannounce&amp;tr=udp%3A%2F%2Ftracker1.itzmx.com%3A8080%2Fannounce&amp;tr=udp%3A%2F%2Ftracker2.itzmx.com%3A6961%2Fannounce&amp;tr=udp%3A%2F%2Ftracker3.itzmx.com%3A6961%2Fannounce&amp;tr=udp%3A%2F%2Ftracker4.itzmx.com%3A2710%2Fannounce&amp;tr=http%3A%2F%2Fnyaa.tracker.wf%3A7777%2Fannounce&amp;tr=http%3A%2F%2Ft.nyaatracker.com%2Fannounce&amp;tr=http%3A%2F%2Ft.acg.rip%3A6699%2Fannounce&amp;tr=http%3A%2F%2Ftr.bangumi.moe%3A6969%2Fannounce&amp;tr=http%3A%2F%2Fshare.camoe.cn%3A8080%2Fannounce&amp;tr=http%3A%2F%2Fsukebei.tracker.wf%3A8888%2Fannounce&amp;tr=http%3A%2F%2Fopenbittorrent.com%3A80%2Fannounce&amp;tr=https%3A%2F%2Fopentracker.i2p.rocks%3A443%2Fannounce&amp;tr=https%3A%2F%2Ftracker.nanoha.org%3A443%2Fannounce&amp;tr=https%3A%2F%2Ftracker.cyber-hub.net%3A443%2Fannounce&amp;tr=https%3A%2F%2Ftr.burnabyhighstar.com%3A443%2Fannounce"  length="1"  type="application/x-bittorrent" ></enclosure>
<author><![CDATA[nekomoekissaten]]></author>
<guid isPermaLink="true" >http://share.dmhy.org/topics/view/654543_10_Sousou_no_Frieren_07_1080p.html</guid>
<category domain="http://share.dmhy.org/topics/list/sort_id/2" ><![CDATA[動畫]]></category>
</item>
<item>
<title><![CDATA[【喵萌奶茶屋】★10月新番★[葬送的芙莉蓮 / Sousou no Frieren][06][1080p][繁日雙語][招募翻譯]]]></title>
<link>http://share.dmhy.org/topics/view/653772_10_Sousou_no_Frieren_06_1080p.html</link>
<pubDate>Mon, 16 Oct 2023 22:48:00 +0800</pubDate>
<description><![CDATA[<p><img src="https://s2.loli.net/2023/10/04/2YE8DWOANHUxJKf.png" /></p>
<hr />
<p><img src="https://nekomoe.pages.dev/images/mainVisual/char.jpg" /></p>
<hr />
<p>喵萌奶茶屋招募以下職位的小伙伴！</p>
<p>1.<strong>翻譯</strong>：沒有證書要求，能正確聽譯一集動畫即可</p>
<p>2.<strong>時軸</strong>：使用 Aegisub 準確拉軸對幀並設置合適的樣式、字體、螢幕字</p>
<p>3.<strong>後期</strong>：懂時軸基礎知識並使用 Vapoursynth 或 Avisynth 內嵌字幕，做種發布分流</p>
<p>4.<strong>壓制</strong>：能獨立寫程式碼最佳化畫質並使用 VapourSynth 或 AviSynth 壓製 BDRip / DVDRip</p>
<p>5.<strong>特效</strong>：熟練應用特效代碼製作合適的歌詞特效</p>
<p>6.<strong>畫師</strong>：畫海報、字幕娘、表情包、LOGO 等</p>
<p>7.<strong>分流</strong>：捐獻伺服器盒子永久保種本組合集資源</p>
<p>歡迎熱愛二次元熱衷字幕製作的小伙伴加入！申請請加入 QQ 群：421320480</p>
<p>粉絲群：477659567</p>
<hr />
<p>奶茶屋所有最新的【<a href="https://github.com/Nekomoekissaten/Nekomoekissaten-Subs" target="_blank" rel="external nofollow"><strong>外掛字幕</strong></a>】在這裡，如果有對本組做過的番有興趣的，歡迎來調 BD 軸！</p>
<p>本組發布的資源請以最新發布為準，最新的 TV 合集，最新的 BDRip 合集是最新修正的資源！</p>
<p>本組發布的外掛字幕請勿隨意修改後發布至公網！</p>
<p>點擊加入【<a href="https://jq.qq.com/?_wv=1027&amp;k=4ERTkKi" target="_blank" rel="external nofollow"><strong>奶茶分流小分隊</strong></a>】，為自己喜愛的番奉獻一份力量！</p>
<hr />
<p>從 2020 年 10 月新番起，本組發布的作品將去掉 Web 片源自帶的片頭！</p>]]></description>
<enclosure url="magnet:?xt=urn:btih:PLMILRPUR7JN3ODZ33WLHE5HIOZYUKQE&amp;dn=&amp;tr=http%3A%2F%2F104.143.10.186%3A8000%2Fannounce&amp;tr=udp%3A%2F%2F104.143.10.186%3A8000%2Fannounce&amp;tr=http%3A%2F%2Ftracker.openbittorrent.com%3A80%2Fannounce&amp;tr=http%3A%2F%2Ftracker3.itzmx.com%3A6961%2Fannounce&amp;tr=http%3A%2F%2Ftracker4.itzmx.com%3A2710%2Fannounce&amp;tr=http%3A%2F%2Ftracker.publicbt.com%3A80%2Fannounce&amp;tr=http%3A%2F%2Ftracker.prq.to%2Fannounce&amp;tr=http%3A%2F%2Fopen.acgtracker.com%3A1096%2Fannounce&amp;tr=https%3A%2F%2Ft-115.rhcloud.com%2Fonly_for_ylbud&amp;tr=http%3A%2F%2Ftracker1.itzmx.com%3A8080%2Fannounce&amp;tr=http%3A%2F%2Ftracker2.itzmx.com%3A6961%2Fannounce&amp;tr=udp%3A%2F%2Ftracker1.itzmx.com%3A8080%2Fannounce&amp;tr=udp%3A%2F%2Ftracker2.itzmx.com%3A6961%2Fannounce&amp;tr=udp%3A%2F%2Ftracker3.itzmx.com%3A6961%2Fannounce&amp;tr=udp%3A%2F%2Ftracker4.itzmx.com%3A2710%2Fannounce&amp;tr=http%3A%2F%2Fnyaa.tracker.wf%3A7777%2Fannounce&amp;tr=http%3A%2F%2Ft.nyaatracker.com%2Fannounce&amp;tr=http%3A%2F%2Ft.acg.rip%3A6699%2Fannounce&amp;tr=http%3A%2F%2Ftr.bangumi.moe%3A6969%2Fannounce&amp;tr=http%3A%2F%2Fshare.camoe.cn%3A8080%2Fannounce&amp;tr=http%3A%2F%2Fsukebei.tracker.wf%3A8888%2Fannounce&amp;tr=http%3A%2F%2Fopenbittorrent.com%3A80%2Fannounce&amp;tr=https%3A%2F%2Fopentracker.i2p.rocks%3A443%2Fannounce&amp;tr=https%3A%2F%2Ftracker.nanoha.org%3A443%2Fannounce&amp;tr=https%3A%2F%2Ftracker.cyber-hub.net%3A443%2Fannounce&amp;tr=https%3A%2F%2Ftr.burnabyhighstar.com%3A443%2Fannounce"  length="1"  type="application/x-bittorrent" ></enclosure>
<author><![CDATA[nekomoekissaten]]></author>
<guid isPermaLink="true" >http://share.dmhy.org/topics/view/653772_10_Sousou_no_Frieren_06_1080p.html</guid>
<category domain="http://share.dmhy.org/topics/list/sort_id/2" ><![CDATA[動畫]]></category>
</item>
<item>
<title><![CDATA[【喵萌奶茶屋】★10月新番★[葬送的芙莉莲 / Sousou no Frieren][06][1080p][简日双语][招募翻译]]]></title>
<link>http://share.dmhy.org/topics/view/653771_10_Sousou_no_Frieren_06_1080p.html</link>
<pubDate>Mon, 16 Oct 2023 22:47:47 +0800</pubDate>
<description><![CDATA[<p><img src="https://s2.loli.net/2023/10/04/2YE8DWOANHUxJKf.png" /></p>
<hr />
<p><img src="https://nekomoe.pages.dev/images/mainVisual/char.jpg" /></p>
<hr />
<p>喵萌奶茶屋招募以下职位的小伙伴！</p>
<p>1.<strong>翻译</strong>：没有证书要求，能正确听译一集动画即可</p>
<p>2.<strong>时轴</strong>：使用 Aegisub 准确拉轴对帧并设置合适的样式、字体、屏幕字</p>
<p>3.<strong>后期</strong>：懂时轴基础知识并使用 Vapoursynth 或 Avisynth 内嵌字幕，做种发布分流</p>
<p>4.<strong>压制</strong>：能独立写代码优化画质并使用 VapourSynth 或 AviSynth 压制 BDRip / DVDRip</p>
<p>5.<strong>特效</strong>：熟练应用特效代码制作合适的歌词特效</p>
<p>6.<strong>画师</strong>：画海报、字幕娘、表情包、LOGO 等</p>
<p>7.<strong>分流</strong>：捐献服务器盒子永久保种本组合集资源</p>
<p>欢迎热爱二次元热衷字幕制作的小伙伴加入！申请请加入 QQ 群：421320480</p>
<p>粉丝群：477659567</p>
<hr />
<p>奶茶屋所有最新的【<a href="https://github.com/Nekomoekissaten/Nekomoekissaten-Subs" target="_blank" rel="external nofollow"><strong>外挂字幕</strong></a>】在这里，如果有对本组做过的番有兴趣的，欢迎来调 BD 轴！</p>
<p>本组发布的资源请以最新发布为准，最新的 TV 合集，最新的 BDRip 合集是最新修正的资源！</p>
<p>本组发布的外挂字幕请勿随意修改后发布至公网！</p>
<p>点击加入【<a href="https://jq.qq.com/?_wv=1027&amp;k=4ERTkKi" target="_blank" rel="external nofollow"><strong>奶茶分流小分队</strong></a>】，为自己喜爱的番奉献一份力量！</p>
<hr />
<p>从 2020 年 10 月新番起，本组发布的作品将去掉 Web 片源自带的片头！</p>]]></description>
<enclosure url="magnet:?xt=urn:btih:X6OE3KVZDA4UJUZ4TFOK2NJZG4PAMBWC&amp;dn=&amp;tr=http%3A%2F%2F104.143.10.186%3A8000%2Fannounce&amp;tr=udp%3A%2F%2F104.143.10.186%3A8000%2Fannounce&amp;tr=http%3A%2F%2Ftracker.openbittorrent.com%3A80%2Fannounce&amp;tr=http%3A%2F%2Ftracker3.itzmx.com%3A6961%2Fannounce&amp;tr=http%3A%2F%2Ftracker4.itzmx.com%3A2710%2Fannounce&amp;tr=http%3A%2F%2Ftracker.publicbt.com%3A80%2Fannounce&amp;tr=http%3A%2F%2Ftracker.prq.to%2Fannounce&amp;tr=http%3A%2F%2Fopen.acgtracker.com%3A1096%2Fannounce&amp;tr=https%3A%2F%2Ft-115.rhcloud.com%2Fonly_for_ylbud&amp;tr=http%3A%2F%2Ftracker1.itzmx.com%3A8080%2Fannounce&amp;tr=http%3A%2F%2Ftracker2.itzmx.com%3A6961%2Fannounce&amp;tr=udp%3A%2F%2Ftracker1.itzmx.com%3A8080%2Fannounce&amp;tr=udp%3A%2F%2Ftracker2.itzmx.com%3A6961%2Fannounce&amp;tr=udp%3A%2F%2Ftracker3.itzmx.com%3A6961%2Fannounce&amp;tr=udp%3A%2F%2Ftracker4.itzmx.com%3A2710%2Fannounce&amp;tr=http%3A%2F%2Fnyaa.tracker.wf%3A7777%2Fannounce&amp;tr=http%3A%2F%2Ft.nyaatracker.com%2Fannounce&amp;tr=http%3A%2F%2Ft.acg.rip%3A6699%2Fannounce&amp;tr=http%3A%2F%2Ftr.bangumi.moe%3A6969%2Fannounce&amp;tr=http%3A%2F%2Fshare.camoe.cn%3A8080%2Fannounce&amp;tr=http%3A%2F%2Fsukebei.tracker.wf%3A8888%2Fannounce&amp;tr=http%3A%2F%2Fopenbittorrent.com%3A80%2Fannounce&amp;tr=https%3A%2F%2Fopentracker.i2p.rocks%3A443%2Fannounce&amp;tr=https%3A%2F%2Ftracker.nanoha.org%3A443%2Fannounce&amp;tr=https%3A%2F%2Ftracker.cyber-hub.net%3A443%2Fannounce&amp;tr=https%3A%2F%2Ftr.burnabyhighstar.com%3A443%2Fannounce"  length="1"  type="application/x-bittorrent" ></enclosure>
<author><![CDATA[nekomoekissaten]]></author>
<guid isPermaLink="true" >http://share.dmhy.org/topics/view/653771_10_Sousou_no_Frieren_06_1080p.html</guid>
<category domain="http://share.dmhy.org/topics/list/sort_id/2" ><![CDATA[動畫]]></category>
</item>
<item>
<title><![CDATA[【喵萌奶茶屋】★10月新番★[葬送的芙莉蓮 / Sousou no Frieren][05][1080p][繁日雙語][招募翻譯]]]></title>
<link>http://share.dmhy.org/topics/view/653200_10_Sousou_no_Frieren_05_1080p.html</link>
<pubDate>Tue, 10 Oct 2023 08:22:38 +0800</pubDate>
<description><![CDATA[<p><img src="https://s2.loli.net/2023/10/04/2YE8DWOANHUxJKf.png" /></p>
<hr />
<p><img src="https://nekomoe.pages.dev/images/mainVisual/char.jpg" /></p>
<hr />
<p>喵萌奶茶屋招募以下職位的小伙伴！</p>
<p>1.<strong>翻譯</strong>：沒有證書要求，能正確聽譯一集動畫即可</p>
<p>2.<strong>時軸</strong>：使用 Aegisub 準確拉軸對幀並設置合適的樣式、字體、螢幕字</p>
<p>3.<strong>後期</strong>：懂時軸基礎知識並使用 Vapoursynth 或 Avisynth 內嵌字幕，做種發布分流</p>
<p>4.<strong>壓制</strong>：能獨立寫程式碼最佳化畫質並使用 VapourSynth 或 AviSynth 壓製 BDRip / DVDRip</p>
<p>5.<strong>特效</strong>：熟練應用特效代碼製作合適的歌詞特效</p>
<p>6.<strong>畫師</strong>：畫海報、字幕娘、表情包、LOGO 等</p>
<p>7.<strong>分流</strong>：捐獻伺服器盒子永久保種本組合集資源</p>
<p>歡迎熱愛二次元熱衷字幕製作的小伙伴加入！申請請加入 QQ 群：421320480</p>
<p>粉絲群：477659567</p>
<hr />
<p>奶茶屋所有最新的【<a href="https://github.com/Nekomoekissaten/Nekomoekissaten-Subs" target="_blank" rel="external nofollow"><strong>外掛字幕</strong></a>】在這裡，如果有對本組做過的番有興趣的，歡迎來調 BD 軸！</p>
<p>本組發布的資源請以最新發布為準，最新的 TV 合集，最新的 BDRip 合集是最新修正的資源！</p>
<p>本組發布的外掛字幕請勿隨意修改後發布至公網！</p>
<p>點擊加入【<a href="https://jq.qq.com/?_wv=1027&amp;k=4ERTkKi" target="_blank" rel="external nofollow"><strong>奶茶分流小分隊</strong></a>】，為自己喜愛的番奉獻一份力量！</p>
<hr />
<p>從 2020 年 10 月新番起，本組發布的作品將去掉 Web 片源自帶的片頭！</p>]]></description>
<enclosure url="magnet:?xt=urn:btih:AINEMT4SKZHALKYURUNZV5KPNCKDVIWM&amp;dn=&amp;tr=http%3A%2F%2F104.143.10.186%3A8000%2Fannounce&amp;tr=udp%3A%2F%2F104.143.10.186%3A8000%2Fannounce&amp;tr=http%3A%2F%2Ftracker.openbittorrent.com%3A80%2Fannounce&amp;tr=http%3A%2F%2Ftracker3.itzmx.com%3A6961%2Fannounce&amp;tr=http%3A%2F%2Ftracker4.itzmx.com%3A2710%2Fannounce&amp;tr=http%3A%2F%2Ftracker.publicbt.com%3A80%2Fannounce&amp;tr=http%3A%2F%2Ftracker.prq.to%2Fannounce&amp;tr=http%3A%2F%2Fopen.acgtracker.com%3A1096%2Fannounce&amp;tr=https%3A%2F%2Ft-115.rhcloud.com%2Fonly_for_ylbud&amp;tr=http%3A%2F%2Ftracker1.itzmx.com%3A8080%2Fannounce&amp;tr=http%3A%2F%2Ftracker2.itzmx.com%3A6961%2Fannounce&amp;tr=udp%3A%2F%2Ftracker1.itzmx.com%3A8080%2Fannounce&amp;tr=udp%3A%2F%2Ftracker2.itzmx.com%3A6961%2Fannounce&amp;tr=udp%3A%2F%2Ftracker3.itzmx.com%3A6961%2Fannounce&amp;tr=udp%3A%2F%2Ftracker4.itzmx.com%3A2710%2Fannounce&amp;tr=http%3A%2F%2Fnyaa.tracker.wf%3A7777%2Fannounce&amp;tr=http%3A%2F%2Ft.nyaatracker.com%2Fannounce&amp;tr=http%3A%2F%2Ft.acg.rip%3A6699%2Fannounce&amp;tr=http%3A%2F%2Ftr.bangumi.moe%3A6969%2Fannounce&amp;tr=http%3A%2F%2Fshare.camoe.cn%3A8080%2Fannounce&amp;tr=http%3A%2F%2Fsukebei.tracker.wf%3A8888%2Fannounce&amp;tr=http%3A%2F%2Fopenbittorrent.com%3A80%2Fannounce&amp;tr=https%3A%2F%2Fopentracker.i2p.rocks%3A443%2Fannounce&amp;tr=https%3A%2F%2Ftracker.nanoha.org%3A443%2Fannounce&amp;tr=https%3A%2F%2Ftracker.cyber-hub.net%3A443%2Fannounce&amp;tr=https%3A%2F%2Ftr.burnabyhighstar.com%3A443%2Fannounce"  length="1"  type="application/x-bittorrent" ></enclosure>
<author><![CDATA[nekomoekissaten]]></author>
<guid isPermaLink="true" >http://share.dmhy.org/topics/view/653200_10_Sousou_no_Frieren_05_1080p.html</guid>
<category domain="http://share.dmhy.org/topics/list/sort_id/2" ><![CDATA[動畫]]></category>
</item>
<item>
<title><![CDATA[【喵萌奶茶屋】★10月新番★[葬送的芙莉莲 / Sousou no Frieren][05][1080p][简日双语][招募翻译]]]></title>
<link>http://share.dmhy.org/topics/view/653199_10_Sousou_no_Frieren_05_1080p.html</link>
<pubDate>Tue, 10 Oct 2023 08:22:29 +0800</pubDate>
<description><![CDATA[<p><img src="https://s2.loli.net/2023/10/04/2YE8DWOANHUxJKf.png" /></p>
<hr />
<p><img src="https://nekomoe.pages.dev/images/mainVisual/char.jpg" /></p>
<hr />
<p>喵萌奶茶屋招募以下职位的小伙伴！</p>
<p>1.<strong>翻译</strong>：没有证书要求，能正确听译一集动画即可</p>
<p>2.<strong>时轴</strong>：使用 Aegisub 准确拉轴对帧并设置合适的样式、字体、屏幕字</p>
<p>3.<strong>后期</strong>：懂时轴基础知识并使用 Vapoursynth 或 Avisynth 内嵌字幕，做种发布分流</p>
<p>4.<strong>压制</strong>：能独立写代码优化画质并使用 VapourSynth 或 AviSynth 压制 BDRip / DVDRip</p>
<p>5.<strong>特效</strong>：熟练应用特效代码制作合适的歌词特效</p>
<p>6.<strong>画师</strong>：画海报、字幕娘、表情包、LOGO 等</p>
<p>7.<strong>分流</strong>：捐献服务器盒子永久保种本组合集资源</p>
<p>欢迎热爱二次元热衷字幕制作的小伙伴加入！申请请加入 QQ 群：421320480</p>
<p>粉丝群：477659567</p>
<hr />
<p>奶茶屋所有最新的【<a href="https://github.com/Nekomoekissaten/Nekomoekissaten-Subs" target="_blank" rel="external nofollow"><strong>外挂字幕</strong></a>】在这里，如果有对本组做过的番有兴趣的，欢迎来调 BD 轴！</p>
<p>本组发布的资源请以最新发布为准，最新的 TV 合集，最新的 BDRip 合集是最新修正的资源！</p>
<p>本组发布的外挂字幕请勿随意修改后发布至公网！</p>
<p>点击加入【<a href="https://jq.qq.com/?_wv=1027&amp;k=4ERTkKi" target="_blank" rel="external nofollow"><strong>奶茶分流小分队</strong></a>】，为自己喜爱的番奉献一份力量！</p>
<hr />
<p>从 2020 年 10 月新番起，本组发布的作品将去掉 Web 片源自带的片头！</p>]]></description>
<enclosure url="magnet:?xt=urn:btih:AZ5X6SHWVYWFBDSWTGXTXJZBFP5QVAVJ&amp;dn=&amp;tr=http%3A%2F%2F104.143.10.186%3A8000%2Fannounce&amp;tr=udp%3A%2F%2F104.143.10.186%3A8000%2Fannounce&amp;tr=http%3A%2F%2Ftracker.openbittorrent.com%3A80%2Fannounce&amp;tr=http%3A%2F%2Ftracker3.itzmx.com%3A6961%2Fannounce&amp;tr=http%3A%2F%2Ftracker4.itzmx.com%3A2710%2Fannounce&amp;tr=http%3A%2F%2Ftracker.publicbt.com%3A80%2Fannounce&amp;tr=http%3A%2F%2Ftracker.prq.to%2Fannounce&amp;tr=http%3A%2F%2Fopen.acgtracker.com%3A1096%2Fannounce&amp;tr=https%3A%2F%2Ft-115.rhcloud.com%2Fonly_for_ylbud&amp;tr=http%3A%2F%2Ftracker1.itzmx.com%3A8080%2Fannounce&amp;tr=http%3A%2F%2Ftracker2.itzmx.com%3A6961%2Fannounce&amp;tr=udp%3A%2F%2Ftracker1.itzmx.com%3A8080%2Fannounce&amp;tr=udp%3A%2F%2Ftracker2.itzmx.com%3A6961%2Fannounce&amp;tr=udp%3A%2F%2Ftracker3.itzmx.com%3A6961%2Fannounce&amp;tr=udp%3A%2F%2Ftracker4.itzmx.com%3A2710%2Fannounce&amp;tr=http%3A%2F%2Fnyaa.tracker.wf%3A7777%2Fannounce&amp;tr=http%3A%2F%2Ft.nyaatracker.com%2Fannounce&amp;tr=http%3A%2F%2Ft.acg.rip%3A6699%2Fannounce&amp;tr=http%3A%2F%2Ftr.bangumi.moe%3A6969%2Fannounce&amp;tr=http%3A%2F%2Fshare.camoe.cn%3A8080%2Fannounce&amp;tr=http%3A%2F%2Fsukebei.tracker.wf%3A8888%2Fannounce&amp;tr=http%3A%2F%2Fopenbittorrent.com%3A80%2Fannounce&amp;tr=https%3A%2F%2Fopentracker.i2p.rocks%3A443%2Fannounce&amp;tr=https%3A%2F%2Ftracker.nanoha.org%3A443%2Fannounce&amp;tr=https%3A%2F%2Ftracker.cyber-hub.net%3A443%2Fannounce&amp;tr=https%3A%2F%2Ftr.burnabyhighstar.com%3A443%2Fannounce"  length="1"  type="application/x-bittorrent" ></enclosure>
<author><![CDATA[nekomoekissaten]]></author>
<guid isPermaLink="true" >http://share.dmhy.org/topics/view/653199_10_Sousou_no_Frieren_05_1080p.html</guid>
<category domain="http://share.dmhy.org/topics/list/sort_id/2" ><![CDATA[動畫]]></category>
</item>
<item>
<title><![CDATA[【喵萌奶茶屋】★10月新番★[葬送的芙莉蓮 / Sousou no Frieren][04][1080p][繁日雙語][招募翻譯]]]></title>
<link>http://share.dmhy.org/topics/view/653070_10_Sousou_no_Frieren_04_1080p.html</link>
<pubDate>Sun, 08 Oct 2023 18:31:11 +0800</pubDate>
<description><![CDATA[<p><img src="https://s2.loli.net/2023/10/04/2YE8DWOANHUxJKf.png" /></p>
<hr />
<p><img src="https://nekomoe.pages.dev/images/mainVisual/char.jpg" /></p>
<hr />
<p>喵萌奶茶屋招募以下職位的小伙伴！</p>
<p>1.<strong>翻譯</strong>：沒有證書要求，能正確聽譯一集動畫即可</p>
<p>2.<strong>時軸</strong>：使用 Aegisub 準確拉軸對幀並設置合適的樣式、字體、螢幕字</p>
<p>3.<strong>後期</strong>：懂時軸基礎知識並使用 Vapoursynth 或 Avisynth 內嵌字幕，做種發布分流</p>
<p>4.<strong>壓制</strong>：能獨立寫程式碼最佳化畫質並使用 VapourSynth 或 AviSynth 壓製 BDRip / DVDRip</p>
<p>5.<strong>特效</strong>：熟練應用特效代碼製作合適的歌詞特效</p>
<p>6.<strong>畫師</strong>：畫海報、字幕娘、表情包、LOGO 等</p>
<p>7.<strong>分流</strong>：捐獻伺服器盒子永久保種本組合集資源</p>
<p>歡迎熱愛二次元熱衷字幕製作的小伙伴加入！申請請加入 QQ 群：421320480</p>
<p>粉絲群：477659567</p>
<hr />
<p>奶茶屋所有最新的【<a href="https://github.com/Nekomoekissaten/Nekomoekissaten-Subs" target="_blank" rel="external nofollow"><strong>外掛字幕</strong></a>】在這裡，如果有對本組做過的番有興趣的，歡迎來調 BD 軸！</p>
<p>本組發布的資源請以最新發布為準，最新的 TV 合集，最新的 BDRip 合集是最新修正的資源！</p>
<p>本組發布的外掛字幕請勿隨意修改後發布至公網！</p>
<p>點擊加入【<a href="https://jq.qq.com/?_wv=1027&amp;k=4ERTkKi" target="_blank" rel="external nofollow"><strong>奶茶分流小分隊</strong></a>】，為自己喜愛的番奉獻一份力量！</p>
<hr />
<p>從 2020 年 10 月新番起，本組發布的作品將去掉 Web 片源自帶的片頭！</p>]]></description>
<enclosure url="magnet:?xt=urn:btih:BZMV3JYZZF6LKVFDO35H3KGHGX635LLB&amp;dn=&amp;tr=http%3A%2F%2F104.143.10.186%3A8000%2Fannounce&amp;tr=udp%3A%2F%2F104.143.10.186%3A8000%2Fannounce&amp;tr=http%3A%2F%2Ftracker.openbittorrent.com%3A80%2Fannounce&amp;tr=http%3A%2F%2Ftracker3.itzmx.com%3A6961%2Fannounce&amp;tr=http%3A%2F%2Ftracker4.itzmx.com%3A2710%2Fannounce&amp;tr=http%3A%2F%2Ftracker.publicbt.com%3A80%2Fannounce&amp;tr=http%3A%2F%2Ftracker.prq.to%2Fannounce&amp;tr=http%3A%2F%2Fopen.acgtracker.com%3A1096%2Fannounce&amp;tr=https%3A%2F%2Ft-115.rhcloud.com%2Fonly_for_ylbud&amp;tr=http%3A%2F%2Ftracker1.itzmx.com%3A8080%2Fannounce&amp;tr=http%3A%2F%2Ftracker2.itzmx.com%3A6961%2Fannounce&amp;tr=udp%3A%2F%2Ftracker1.itzmx.com%3A8080%2Fannounce&amp;tr=udp%3A%2F%2Ftracker2.itzmx.com%3A6961%2Fannounce&amp;tr=udp%3A%2F%2Ftracker3.itzmx.com%3A6961%2Fannounce&amp;tr=udp%3A%2F%2Ftracker4.itzmx.com%3A2710%2Fannounce&amp;tr=http%3A%2F%2Fnyaa.tracker.wf%3A7777%2Fannounce&amp;tr=http%3A%2F%2Ft.nyaatracker.com%2Fannounce&amp;tr=http%3A%2F%2Ft.acg.rip%3A6699%2Fannounce&amp;tr=http%3A%2F%2Ftr.bangumi.moe%3A6969%2Fannounce&amp;tr=http%3A%2F%2Fshare.camoe.cn%3A8080%2Fannounce&amp;tr=http%3A%2F%2Fsukebei.tracker.wf%3A8888%2Fannounce&amp;tr=http%3A%2F%2Fopenbittorrent.com%3A80%2Fannounce&amp;tr=https%3A%2F%2Fopentracker.i2p.rocks%3A443%2Fannounce&amp;tr=https%3A%2F%2Ftracker.nanoha.org%3A443%2Fannounce&amp;tr=https%3A%2F%2Ftracker.cyber-hub.net%3A443%2Fannounce&amp;tr=https%3A%2F%2Ftr.burnabyhighstar.com%3A443%2Fannounce"  length="1"  type="application/x-bittorrent" ></enclosure>
<author><![CDATA[nekomoekissaten]]></author>
<guid isPermaLink="true" >http://share.dmhy.org/topics/view/653070_10_Sousou_no_Frieren_04_1080p.html</guid>
<category domain="http://share.dmhy.org/topics/list/sort_id/2" ><![CDATA[動畫]]></category>
</item>
<item>
<title><![CDATA[【喵萌奶茶屋】★10月新番★[葬送的芙莉莲 / Sousou no Frieren][04][1080p][简日双语][招募翻译]]]></title>
<link>http://share.dmhy.org/topics/view/653069_10_Sousou_no_Frieren_04_1080p.html</link>
<pubDate>Sun, 08 Oct 2023 18:31:00 +0800</pubDate>
<description><![CDATA[<p><img src="https://s2.loli.net/2023/10/04/2YE8DWOANHUxJKf.png" /></p>
<hr />
<p><img src="https://nekomoe.pages.dev/images/mainVisual/char.jpg" /></p>
<hr />
<p>喵萌奶茶屋招募以下职位的小伙伴！</p>
<p>1.<strong>翻译</strong>：没有证书要求，能正确听译一集动画即可</p>
<p>2.<strong>时轴</strong>：使用 Aegisub 准确拉轴对帧并设置合适的样式、字体、屏幕字</p>
<p>3.<strong>后期</strong>：懂时轴基础知识并使用 Vapoursynth 或 Avisynth 内嵌字幕，做种发布分流</p>
<p>4.<strong>压制</strong>：能独立写代码优化画质并使用 VapourSynth 或 AviSynth 压制 BDRip / DVDRip</p>
<p>5.<strong>特效</strong>：熟练应用特效代码制作合适的歌词特效</p>
<p>6.<strong>画师</strong>：画海报、字幕娘、表情包、LOGO 等</p>
<p>7.<strong>分流</strong>：捐献服务器盒子永久保种本组合集资源</p>
<p>欢迎热爱二次元热衷字幕制作的小伙伴加入！申请请加入 QQ 群：421320480</p>
<p>粉丝群：477659567</p>
<hr />
<p>奶茶屋所有最新的【<a href="https://github.com/Nekomoekissaten/Nekomoekissaten-Subs" target="_blank" rel="external nofollow"><strong>外挂字幕</strong></a>】在这里，如果有对本组做过的番有兴趣的，欢迎来调 BD 轴！</p>
<p>本组发布的资源请以最新发布为准，最新的 TV 合集，最新的 BDRip 合集是最新修正的资源！</p>
<p>本组发布的外挂字幕请勿随意修改后发布至公网！</p>
<p>点击加入【<a href="https://jq.qq.com/?_wv=1027&amp;k=4ERTkKi" target="_blank" rel="external nofollow"><strong>奶茶分流小分队</strong></a>】，为自己喜爱的番奉献一份力量！</p>
<hr />
<p>从 2020 年 10 月新番起，本组发布的作品将去掉 Web 片源自带的片头！</p>]]></description>
<enclosure url="magnet:?xt=urn:btih:MTF7DS4WUOCKQIV5VLFO7ITUHARJF4PK&amp;dn=&amp;tr=http%3A%2F%2F104.143.10.186%3A8000%2Fannounce&amp;tr=udp%3A%2F%2F104.143.10.186%3A8000%2Fannounce&amp;tr=http%3A%2F%2Ftracker.openbittorrent.com%3A80%2Fannounce&amp;tr=http%3A%2F%2Ftracker3.itzmx.com%3A6961%2Fannounce&amp;tr=http%3A%2F%2Ftracker4.itzmx.com%3A2710%2Fannounce&amp;tr=http%3A%2F%2Ftracker.publicbt.com%3A80%2Fannounce&amp;tr=http%3A%2F%2Ftracker.prq.to%2Fannounce&amp;tr=http%3A%2F%2Fopen.acgtracker.com%3A1096%2Fannounce&amp;tr=https%3A%2F%2Ft-115.rhcloud.com%2Fonly_for_ylbud&amp;tr=http%3A%2F%2Ftracker1.itzmx.com%3A8080%2Fannounce&amp;tr=http%3A%2F%2Ftracker2.itzmx.com%3A6961%2Fannounce&amp;tr=udp%3A%2F%2Ftracker1.itzmx.com%3A8080%2Fannounce&amp;tr=udp%3A%2F%2Ftracker2.itzmx.com%3A6961%2Fannounce&amp;tr=udp%3A%2F%2Ftracker3.itzmx.com%3A6961%2Fannounce&amp;tr=udp%3A%2F%2Ftracker4.itzmx.com%3A2710%2Fannounce&amp;tr=http%3A%2F%2Fnyaa.tracker.wf%3A7777%2Fannounce&amp;tr=http%3A%2F%2Ft.nyaatracker.com%2Fannounce&amp;tr=http%3A%2F%2Ft.acg.rip%3A6699%2Fannounce&amp;tr=http%3A%2F%2Ftr.bangumi.moe%3A6969%2Fannounce&amp;tr=http%3A%2F%2Fshare.camoe.cn%3A8080%2Fannounce&amp;tr=http%3A%2F%2Fsukebei.tracker.wf%3A8888%2Fannounce&amp;tr=http%3A%2F%2Fopenbittorrent.com%3A80%2Fannounce&amp;tr=https%3A%2F%2Fopentracker.i2p.rocks%3A443%2Fannounce&amp;tr=https%3A%2F%2Ftracker.nanoha.org%3A443%2Fannounce&amp;tr=https%3A%2F%2Ftracker.cyber-hub.net%3A443%2Fannounce&amp;tr=https%3A%2F%2Ftr.burnabyhighstar.com%3A443%2Fannounce"  length="1"  type="application/x-bittorrent" ></enclosure>
<author><![CDATA[nekomoekissaten]]></author>
<guid isPermaLink="true" >http://share.dmhy.org/topics/view/653069_10_Sousou_no_Frieren_04_1080p.html</guid>
<category domain="http://share.dmhy.org/topics/list/sort_id/2" ><![CDATA[動畫]]></category>
</item>
<item>
<title><![CDATA[【喵萌奶茶屋】★10月新番★[葬送的芙莉蓮 / Sousou no Frieren][03][1080p][繁日雙語][招募翻譯]]]></title>
<link>http://share.dmhy.org/topics/view/652972_10_Sousou_no_Frieren_03_1080p.html</link>
<pubDate>Sat, 07 Oct 2023 21:52:08 +0800</pubDate>
<description><![CDATA[<p><img src="https://s2.loli.net/2023/10/04/2YE8DWOANHUxJKf.png" /></p>
<hr />
<p><img src="https://nekomoe.pages.dev/images/mainVisual/char.jpg" /></p>
<hr />
<p>喵萌奶茶屋招募以下職位的小伙伴！</p>
<p>1.<strong>翻譯</strong>：沒有證書要求，能正確聽譯一集動畫即可</p>
<p>2.<strong>時軸</strong>：使用 Aegisub 準確拉軸對幀並設置合適的樣式、字體、螢幕字</p>
<p>3.<strong>後期</strong>：懂時軸基礎知識並使用 Vapoursynth 或 Avisynth 內嵌字幕，做種發布分流</p>
<p>4.<strong>壓制</strong>：能獨立寫程式碼最佳化畫質並使用 VapourSynth 或 AviSynth 壓製 BDRip / DVDRip</p>
<p>5.<strong>特效</strong>：熟練應用特效代碼製作合適的歌詞特效</p>
<p>6.<strong>畫師</strong>：畫海報、字幕娘、表情包、LOGO 等</p>
<p>7.<strong>分流</strong>：捐獻伺服器盒子永久保種本組合集資源</p>
<p>歡迎熱愛二次元熱衷字幕製作的小伙伴加入！申請請加入 QQ 群：421320480</p>
<p>粉絲群：477659567</p>
<hr />
<p>奶茶屋所有最新的【<a href="https://github.com/Nekomoekissaten/Nekomoekissaten-Subs" target="_blank" rel="external nofollow"><strong>外掛字幕</strong></a>】在這裡，如果有對本組做過的番有興趣的，歡迎來調 BD 軸！</p>
<p>本組發布的資源請以最新發布為準，最新的 TV 合集，最新的 BDRip 合集是最新修正的資源！</p>
<p>本組發布的外掛字幕請勿隨意修改後發布至公網！</p>
<p>點擊加入【<a href="https://jq.qq.com/?_wv=1027&amp;k=4ERTkKi" target="_blank" rel="external nofollow"><strong>奶茶分流小分隊</strong></a>】，為自己喜愛的番奉獻一份力量！</p>
<hr />
<p>從 2020 年 10 月新番起，本組發布的作品將去掉 Web 片源自帶的片頭！</p>]]></description>
<enclosure url="magnet:?xt=urn:btih:W7Z3PEEPMXG5T3H7XSS467UWAAOG56IL&amp;dn=&amp;tr=http%3A%2F%2F104.143.10.186%3A8000%2Fannounce&amp;tr=udp%3A%2F%2F104.143.10.186%3A8000%2Fannounce&amp;tr=http%3A%2F%2Ftracker.openbittorrent.com%3A80%2Fannounce&amp;tr=http%3A%2F%2Ftracker3.itzmx.com%3A6961%2Fannounce&amp;tr=http%3A%2F%2Ftracker4.itzmx.com%3A2710%2Fannounce&amp;tr=http%3A%2F%2Ftracker.publicbt.com%3A80%2Fannounce&amp;tr=http%3A%2F%2Ftracker.prq.to%2Fannounce&amp;tr=http%3A%2F%2Fopen.acgtracker.com%3A1096%2Fannounce&amp;tr=https%3A%2F%2Ft-115.rhcloud.com%2Fonly_for_ylbud&amp;tr=http%3A%2F%2Ftracker1.itzmx.com%3A8080%2Fannounce&amp;tr=http%3A%2F%2Ftracker2.itzmx.com%3A6961%2Fannounce&amp;tr=udp%3A%2F%2Ftracker1.itzmx.com%3A8080%2Fannounce&amp;tr=udp%3A%2F%2Ftracker2.itzmx.com%3A6961%2Fannounce&amp;tr=udp%3A%2F%2Ftracker3.itzmx.com%3A6961%2Fannounce&amp;tr=udp%3A%2F%2Ftracker4.itzmx.com%3A2710%2Fannounce&amp;tr=http%3A%2F%2Fnyaa.tracker.wf%3A7777%2Fannounce&amp;tr=http%3A%2F%2Ft.nyaatracker.com%2Fannounce&amp;tr=http%3A%2F%2Ft.acg.rip%3A6699%2Fannounce&amp;tr=http%3A%2F%2Ftr.bangumi.moe%3A6969%2Fannounce&amp;tr=http%3A%2F%2Fshare.camoe.cn%3A8080%2Fannounce&amp;tr=http%3A%2F%2Fsukebei.tracker.wf%3A8888%2Fannounce&amp;tr=http%3A%2F%2Fopenbittorrent.com%3A80%2Fannounce&amp;tr=https%3A%2F%2Fopentracker.i2p.rocks%3A443%2Fannounce&amp;tr=https%3A%2F%2Ftracker.nanoha.org%3A443%2Fannounce&amp;tr=https%3A%2F%2Ftracker.cyber-hub.net%3A443%2Fannounce&amp;tr=https%3A%2F%2Ftr.burnabyhighstar.com%3A443%2Fannounce"  length="1"  type="application/x-bittorrent" ></enclosure>
<author><![CDATA[nekomoekissaten]]></author>
<guid isPermaLink="true" >http://share.dmhy.org/topics/view/652972_10_Sousou_no_Frieren_03_1080p.html</guid>
<category domain="http://share.dmhy.org/topics/list/sort_id/2" ><![CDATA[動畫]]></category>
</item>
<item>
<title><![CDATA[【喵萌奶茶屋】★10月新番★[葬送的芙莉莲 / Sousou no Frieren][03][1080p][简日双语][招募翻译]]]></title>
<link>http://share.dmhy.org/topics/view/652971_10_Sousou_no_Frieren_03_1080p.html</link>
<pubDate>Sat, 07 Oct 2023 21:51:55 +0800</pubDate>
<description><![CDATA[<p><img src="https://s2.loli.net/2023/10/04/2YE8DWOANHUxJKf.png" /></p>
<hr />
<p><img src="https://nekomoe.pages.dev/images/mainVisual/char.jpg" /></p>
<hr />
<p>喵萌奶茶屋招募以下职位的小伙伴！</p>
<p>1.<strong>翻译</strong>：没有证书要求，能正确听译一集动画即可</p>
<p>2.<strong>时轴</strong>：使用 Aegisub 准确拉轴对帧并设置合适的样式、字体、屏幕字</p>
<p>3.<strong>后期</strong>：懂时轴基础知识并使用 Vapoursynth 或 Avisynth 内嵌字幕，做种发布分流</p>
<p>4.<strong>压制</strong>：能独立写代码优化画质并使用 VapourSynth 或 AviSynth 压制 BDRip / DVDRip</p>
<p>5.<strong>特效</strong>：熟练应用特效代码制作合适的歌词特效</p>
<p>6.<strong>画师</strong>：画海报、字幕娘、表情包、LOGO 等</p>
<p>7.<strong>分流</strong>：捐献服务器盒子永久保种本组合集资源</p>
<p>欢迎热爱二次元热衷字幕制作的小伙伴加入！申请请加入 QQ 群：421320480</p>
<p>粉丝群：477659567</p>
<hr />
<p>奶茶屋所有最新的【<a href="https://github.com/Nekomoekissaten/Nekomoekissaten-Subs" target="_blank" rel="external nofollow"><strong>外挂字幕</strong></a>】在这里，如果有对本组做过的番有兴趣的，欢迎来调 BD 轴！</p>
<p>本组发布的资源请以最新发布为准，最新的 TV 合集，最新的 BDRip 合集是最新修正的资源！</p>
<p>本组发布的外挂字幕请勿随意修改后发布至公网！</p>
<p>点击加入【<a href="https://jq.qq.com/?_wv=1027&amp;k=4ERTkKi" target="_blank" rel="external nofollow"><strong>奶茶分流小分队</strong></a>】，为自己喜爱的番奉献一份力量！</p>
<hr />
<p>从 2020 年 10 月新番起，本组发布的作品将去掉 Web 片源自带的片头！</p>]]></description>
<enclosure url="magnet:?xt=urn:btih:SRPERKG77HMMDT6KQNVGIMATA5S7E2EK&amp;dn=&amp;tr=http%3A%2F%2F104.143.10.186%3A8000%2Fannounce&amp;tr=udp%3A%2F%2F104.143.10.186%3A8000%2Fannounce&amp;tr=http%3A%2F%2Ftracker.openbittorrent.com%3A80%2Fannounce&amp;tr=http%3A%2F%2Ftracker3.itzmx.com%3A6961%2Fannounce&amp;tr=http%3A%2F%2Ftracker4.itzmx.com%3A2710%2Fannounce&amp;tr=http%3A%2F%2Ftracker.publicbt.com%3A80%2Fannounce&amp;tr=http%3A%2F%2Ftracker.prq.to%2Fannounce&amp;tr=http%3A%2F%2Fopen.acgtracker.com%3A1096%2Fannounce&amp;tr=https%3A%2F%2Ft-115.rhcloud.com%2Fonly_for_ylbud&amp;tr=http%3A%2F%2Ftracker1.itzmx.com%3A8080%2Fannounce&amp;tr=http%3A%2F%2Ftracker2.itzmx.com%3A6961%2Fannounce&amp;tr=udp%3A%2F%2Ftracker1.itzmx.com%3A8080%2Fannounce&amp;tr=udp%3A%2F%2Ftracker2.itzmx.com%3A6961%2Fannounce&amp;tr=udp%3A%2F%2Ftracker3.itzmx.com%3A6961%2Fannounce&amp;tr=udp%3A%2F%2Ftracker4.itzmx.com%3A2710%2Fannounce&amp;tr=http%3A%2F%2Fnyaa.tracker.wf%3A7777%2Fannounce&amp;tr=http%3A%2F%2Ft.nyaatracker.com%2Fannounce&amp;tr=http%3A%2F%2Ft.acg.rip%3A6699%2Fannounce&amp;tr=http%3A%2F%2Ftr.bangumi.moe%3A6969%2Fannounce&amp;tr=http%3A%2F%2Fshare.camoe.cn%3A8080%2Fannounce&amp;tr=http%3A%2F%2Fsukebei.tracker.wf%3A8888%2Fannounce&amp;tr=http%3A%2F%2Fopenbittorrent.com%3A80%2Fannounce&amp;tr=https%3A%2F%2Fopentracker.i2p.rocks%3A443%2Fannounce&amp;tr=https%3A%2F%2Ftracker.nanoha.org%3A443%2Fannounce&amp;tr=https%3A%2F%2Ftracker.cyber-hub.net%3A443%2Fannounce&amp;tr=https%3A%2F%2Ftr.burnabyhighstar.com%3A443%2Fannounce"  length="1"  type="application/x-bittorrent" ></enclosure>
<author><![CDATA[nekomoekissaten]]></author>
<guid isPermaLink="true" >http://share.dmhy.org/topics/view/652971_10_Sousou_no_Frieren_03_1080p.html</guid>
<category domain="http://share.dmhy.org/topics/list/sort_id/2" ><![CDATA[動畫]]></category>
</item>
<item>
<title><![CDATA[【喵萌奶茶屋】★10月新番★[葬送的芙莉蓮 / Sousou no Frieren][02][1080p][繁日雙語][招募翻譯]]]></title>
<link>http://share.dmhy.org/topics/view/652905_10_Sousou_no_Frieren_02_1080p.html</link>
<pubDate>Sat, 07 Oct 2023 00:52:57 +0800</pubDate>
<description><![CDATA[<p><img src="https://s2.loli.net/2023/10/04/2YE8DWOANHUxJKf.png" /></p>
<hr />
<p><img src="https://nekomoe.pages.dev/images/mainVisual/char.jpg" /></p>
<hr />
<p>喵萌奶茶屋招募以下職位的小伙伴！</p>
<p>1.<strong>翻譯</strong>：沒有證書要求，能正確聽譯一集動畫即可</p>
<p>2.<strong>時軸</strong>：使用 Aegisub 準確拉軸對幀並設置合適的樣式、字體、螢幕字</p>
<p>3.<strong>後期</strong>：懂時軸基礎知識並使用 Vapoursynth 或 Avisynth 內嵌字幕，做種發布分流</p>
<p>4.<strong>壓制</strong>：能獨立寫程式碼最佳化畫質並使用 VapourSynth 或 AviSynth 壓製 BDRip / DVDRip</p>
<p>5.<strong>特效</strong>：熟練應用特效代碼製作合適的歌詞特效</p>
<p>6.<strong>畫師</strong>：畫海報、字幕娘、表情包、LOGO 等</p>
<p>7.<strong>分流</strong>：捐獻伺服器盒子永久保種本組合集資源</p>
<p>歡迎熱愛二次元熱衷字幕製作的小伙伴加入！申請請加入 QQ 群：421320480</p>
<p>粉絲群：477659567</p>
<hr />
<p>奶茶屋所有最新的【<a href="https://github.com/Nekomoekissaten/Nekomoekissaten-Subs" target="_blank" rel="external nofollow"><strong>外掛字幕</strong></a>】在這裡，如果有對本組做過的番有興趣的，歡迎來調 BD 軸！</p>
<p>本組發布的資源請以最新發布為準，最新的 TV 合集，最新的 BDRip 合集是最新修正的資源！</p>
<p>本組發布的外掛字幕請勿隨意修改後發布至公網！</p>
<p>點擊加入【<a href="https://jq.qq.com/?_wv=1027&amp;k=4ERTkKi" target="_blank" rel="external nofollow"><strong>奶茶分流小分隊</strong></a>】，為自己喜愛的番奉獻一份力量！</p>
<hr />
<p>從 2020 年 10 月新番起，本組發布的作品將去掉 Web 片源自帶的片頭！</p>]]></description>
<enclosure url="magnet:?xt=urn:btih:UCXJFZHXCKSQUFHG2DJGEULWPHAK7Y4A&amp;dn=&amp;tr=http%3A%2F%2F104.143.10.186%3A8000%2Fannounce&amp;tr=udp%3A%2F%2F104.143.10.186%3A8000%2Fannounce&amp;tr=http%3A%2F%2Ftracker.openbittorrent.com%3A80%2Fannounce&amp;tr=http%3A%2F%2Ftracker3.itzmx.com%3A6961%2Fannounce&amp;tr=http%3A%2F%2Ftracker4.itzmx.com%3A2710%2Fannounce&amp;tr=http%3A%2F%2Ftracker.publicbt.com%3A80%2Fannounce&amp;tr=http%3A%2F%2Ftracker.prq.to%2Fannounce&amp;tr=http%3A%2F%2Fopen.acgtracker.com%3A1096%2Fannounce&amp;tr=https%3A%2F%2Ft-115.rhcloud.com%2Fonly_for_ylbud&amp;tr=http%3A%2F%2Ftracker1.itzmx.com%3A8080%2Fannounce&amp;tr=http%3A%2F%2Ftracker2.itzmx.com%3A6961%2Fannounce&amp;tr=udp%3A%2F%2Ftracker1.itzmx.com%3A8080%2Fannounce&amp;tr=udp%3A%2F%2Ftracker2.itzmx.com%3A6961%2Fannounce&amp;tr=udp%3A%2F%2Ftracker3.itzmx.com%3A6961%2Fannounce&amp;tr=udp%3A%2F%2Ftracker4.itzmx.com%3A2710%2Fannounce&amp;tr=http%3A%2F%2Fnyaa.tracker.wf%3A7777%2Fannounce&amp;tr=http%3A%2F%2Ft.nyaatracker.com%2Fannounce&amp;tr=http%3A%2F%2Ft.acg.rip%3A6699%2Fannounce&amp;tr=http%3A%2F%2Ftr.bangumi.moe%3A6969%2Fannounce&amp;tr=http%3A%2F%2Fshare.camoe.cn%3A8080%2Fannounce&amp;tr=http%3A%2F%2Fsukebei.tracker.wf%3A8888%2Fannounce&amp;tr=http%3A%2F%2Fopenbittorrent.com%3A80%2Fannounce&amp;tr=https%3A%2F%2Fopentracker.i2p.rocks%3A443%2Fannounce&amp;tr=https%3A%2F%2Ftracker.nanoha.org%3A443%2Fannounce&amp;tr=https%3A%2F%2Ftracker.cyber-hub.net%3A443%2Fannounce&amp;tr=https%3A%2F%2Ftr.burnabyhighstar.com%3A443%2Fannounce"  length="1"  type="application/x-bittorrent" ></enclosure>
<author><![CDATA[nekomoekissaten]]></author>
<guid isPermaLink="true" >http://share.dmhy.org/topics/view/652905_10_Sousou_no_Frieren_02_1080p.html</guid>
<category domain="http://share.dmhy.org/topics/list/sort_id/2" ><![CDATA[動畫]]></category>
</item>
<item>
<title><![CDATA[【喵萌奶茶屋】★10月新番★[葬送的芙莉莲 / Sousou no Frieren][02][1080p][简日双语][招募翻译]]]></title>
<link>http://share.dmhy.org/topics/view/652904_10_Sousou_no_Frieren_02_1080p.html</link>
<pubDate>Sat, 07 Oct 2023 00:52:47 +0800</pubDate>
<description><![CDATA[<p><img src="https://s2.loli.net/2023/10/04/2YE8DWOANHUxJKf.png" /></p>
<hr />
<p><img src="https://nekomoe.pages.dev/images/mainVisual/char.jpg" /></p>
<hr />
<p>喵萌奶茶屋招募以下职位的小伙伴！</p>
<p>1.<strong>翻译</strong>：没有证书要求，能正确听译一集动画即可</p>
<p>2.<strong>时轴</strong>：使用 Aegisub 准确拉轴对帧并设置合适的样式、字体、屏幕字</p>
<p>3.<strong>后期</strong>：懂时轴基础知识并使用 Vapoursynth 或 Avisynth 内嵌字幕，做种发布分流</p>
<p>4.<strong>压制</strong>：能独立写代码优化画质并使用 VapourSynth 或 AviSynth 压制 BDRip / DVDRip</p>
<p>5.<strong>特效</strong>：熟练应用特效代码制作合适的歌词特效</p>
<p>6.<strong>画师</strong>：画海报、字幕娘、表情包、LOGO 等</p>
<p>7.<strong>分流</strong>：捐献服务器盒子永久保种本组合集资源</p>
<p>欢迎热爱二次元热衷字幕制作的小伙伴加入！申请请加入 QQ 群：421320480</p>
<p>粉丝群：477659567</p>
<hr />
<p>奶茶屋所有最新的【<a href="https://github.com/Nekomoekissaten/Nekomoekissaten-Subs" target="_blank" rel="external nofollow"><strong>外挂字幕</strong></a>】在这里，如果有对本组做过的番有兴趣的，欢迎来调 BD 轴！</p>
<p>本组发布的资源请以最新发布为准，最新的 TV 合集，最新的 BDRip 合集是最新修正的资源！</p>
<p>本组发布的外挂字幕请勿随意修改后发布至公网！</p>
<p>点击加入【<a href="https://jq.qq.com/?_wv=1027&amp;k=4ERTkKi" target="_blank" rel="external nofollow"><strong>奶茶分流小分队</strong></a>】，为自己喜爱的番奉献一份力量！</p>
<hr />
<p>从 2020 年 10 月新番起，本组发布的作品将去掉 Web 片源自带的片头！</p>]]></description>
<enclosure url="magnet:?xt=urn:btih:OWHS6E2N3CSPBVKUIXI3EQ7CIZ5IWCVC&amp;dn=&amp;tr=http%3A%2F%2F104.143.10.186%3A8000%2Fannounce&amp;tr=udp%3A%2F%2F104.143.10.186%3A8000%2Fannounce&amp;tr=http%3A%2F%2Ftracker.openbittorrent.com%3A80%2Fannounce&amp;tr=http%3A%2F%2Ftracker3.itzmx.com%3A6961%2Fannounce&amp;tr=http%3A%2F%2Ftracker4.itzmx.com%3A2710%2Fannounce&amp;tr=http%3A%2F%2Ftracker.publicbt.com%3A80%2Fannounce&amp;tr=http%3A%2F%2Ftracker.prq.to%2Fannounce&amp;tr=http%3A%2F%2Fopen.acgtracker.com%3A1096%2Fannounce&amp;tr=https%3A%2F%2Ft-115.rhcloud.com%2Fonly_for_ylbud&amp;tr=http%3A%2F%2Ftracker1.itzmx.com%3A8080%2Fannounce&amp;tr=http%3A%2F%2Ftracker2.itzmx.com%3A6961%2Fannounce&amp;tr=udp%3A%2F%2Ftracker1.itzmx.com%3A8080%2Fannounce&amp;tr=udp%3A%2F%2Ftracker2.itzmx.com%3A6961%2Fannounce&amp;tr=udp%3A%2F%2Ftracker3.itzmx.com%3A6961%2Fannounce&amp;tr=udp%3A%2F%2Ftracker4.itzmx.com%3A2710%2Fannounce&amp;tr=http%3A%2F%2Fnyaa.tracker.wf%3A7777%2Fannounce&amp;tr=http%3A%2F%2Ft.nyaatracker.com%2Fannounce&amp;tr=http%3A%2F%2Ft.acg.rip%3A6699%2Fannounce&amp;tr=http%3A%2F%2Ftr.bangumi.moe%3A6969%2Fannounce&amp;tr=http%3A%2F%2Fshare.camoe.cn%3A8080%2Fannounce&amp;tr=http%3A%2F%2Fsukebei.tracker.wf%3A8888%2Fannounce&amp;tr=http%3A%2F%2Fopenbittorrent.com%3A80%2Fannounce&amp;tr=https%3A%2F%2Fopentracker.i2p.rocks%3A443%2Fannounce&amp;tr=https%3A%2F%2Ftracker.nanoha.org%3A443%2Fannounce&amp;tr=https%3A%2F%2Ftracker.cyber-hub.net%3A443%2Fannounce&amp;tr=https%3A%2F%2Ftr.burnabyhighstar.com%3A443%2Fannounce"  length="1"  type="application/x-bittorrent" ></enclosure>
<author><![CDATA[nekomoekissaten]]></author>
<guid isPermaLink="true" >http://share.dmhy.org/topics/view/652904_10_Sousou_no_Frieren_02_1080p.html</guid>
<category domain="http://share.dmhy.org/topics/list/sort_id/2" ><![CDATA[動畫]]></category>
</item>
<item>
<title><![CDATA[【喵萌奶茶屋】★10月新番★[葬送的芙莉莲 / Sousou no Frieren][01][1080p][繁日雙語][招募翻譯]]]></title>
<link>http://share.dmhy.org/topics/view/652613_10_Sousou_no_Frieren_01_1080p.html</link>
<pubDate>Wed, 04 Oct 2023 15:27:09 +0800</pubDate>
<description><![CDATA[<p><img src="https://s2.loli.net/2023/10/04/2YE8DWOANHUxJKf.png" /></p>
<hr />
<p><img src="https://nekomoe.pages.dev/images/mainVisual/char.jpg" /></p>
<hr />
<p>喵萌奶茶屋招募以下職位的小伙伴！</p>
<p>1.<strong>翻譯</strong>：沒有證書要求，能正確聽譯一集動畫即可</p>
<p>2.<strong>時軸</strong>：使用 Aegisub 準確拉軸對幀並設置合適的樣式、字體、螢幕字</p>
<p>3.<strong>後期</strong>：懂時軸基礎知識並使用 Vapoursynth 或 Avisynth 內嵌字幕，做種發布分流</p>
<p>4.<strong>壓制</strong>：能獨立寫程式碼最佳化畫質並使用 VapourSynth 或 AviSynth 壓製 BDRip / DVDRip</p>
<p>5.<strong>特效</strong>：熟練應用特效代碼製作合適的歌詞特效</p>
<p>6.<strong>畫師</strong>：畫海報、字幕娘、表情包、LOGO 等</p>
<p>7.<strong>分流</strong>：捐獻伺服器盒子永久保種本組合集資源</p>
<p>歡迎熱愛二次元熱衷字幕製作的小伙伴加入！申請請加入 QQ 群：421320480</p>
<p>粉絲群：477659567</p>
<hr />
<p>奶茶屋所有最新的【<a href="https://github.com/Nekomoekissaten/Nekomoekissaten-Subs" target="_blank" rel="external nofollow"><strong>外掛字幕</strong></a>】在這裡，如果有對本組做過的番有興趣的，歡迎來調 BD 軸！</p>
<p>本組發布的資源請以最新發布為準，最新的 TV 合集，最新的 BDRip 合集是最新修正的資源！</p>
<p>本組發布的外掛字幕請勿隨意修改後發布至公網！</p>
<p>點擊加入【<a href="https://jq.qq.com/?_wv=1027&amp;k=4ERTkKi" target="_blank" rel="external nofollow"><strong>奶茶分流小分隊</strong></a>】，為自己喜愛的番奉獻一份力量！</p>
<hr />
<p>從 2020 年 10 月新番起，本組發布的作品將去掉 Web 片源自帶的片頭！</p>]]></description>
<enclosure url="magnet:?xt=urn:btih:S7COQ5TX4U6PI6U2HYJQ7PXV3LL4BZIE&amp;dn=&amp;tr=http%3A%2F%2F104.143.10.186%3A8000%2Fannounce&amp;tr=udp%3A%2F%2F104.143.10.186%3A8000%2Fannounce&amp;tr=http%3A%2F%2Ftracker.openbittorrent.com%3A80%2Fannounce&amp;tr=http%3A%2F%2Ftracker3.itzmx.com%3A6961%2Fannounce&amp;tr=http%3A%2F%2Ftracker4.itzmx.com%3A2710%2Fannounce&amp;tr=http%3A%2F%2Ftracker.publicbt.com%3A80%2Fannounce&amp;tr=http%3A%2F%2Ftracker.prq.to%2Fannounce&amp;tr=http%3A%2F%2Fopen.acgtracker.com%3A1096%2Fannounce&amp;tr=https%3A%2F%2Ft-115.rhcloud.com%2Fonly_for_ylbud&amp;tr=http%3A%2F%2Ftracker1.itzmx.com%3A8080%2Fannounce&amp;tr=http%3A%2F%2Ftracker2.itzmx.com%3A6961%2Fannounce&amp;tr=udp%3A%2F%2Ftracker1.itzmx.com%3A8080%2Fannounce&amp;tr=udp%3A%2F%2Ftracker2.itzmx.com%3A6961%2Fannounce&amp;tr=udp%3A%2F%2Ftracker3.itzmx.com%3A6961%2Fannounce&amp;tr=udp%3A%2F%2Ftracker4.itzmx.com%3A2710%2Fannounce&amp;tr=http%3A%2F%2Fnyaa.tracker.wf%3A7777%2Fannounce&amp;tr=http%3A%2F%2Ft.nyaatracker.com%2Fannounce&amp;tr=http%3A%2F%2Ft.acg.rip%3A6699%2Fannounce&amp;tr=http%3A%2F%2Ftr.bangumi.moe%3A6969%2Fannounce&amp;tr=http%3A%2F%2Fshare.camoe.cn%3A8080%2Fannounce&amp;tr=http%3A%2F%2Fsukebei.tracker.wf%3A8888%2Fannounce&amp;tr=http%3A%2F%2Fopenbittorrent.com%3A80%2Fannounce&amp;tr=https%3A%2F%2Fopentracker.i2p.rocks%3A443%2Fannounce&amp;tr=https%3A%2F%2Ftracker.nanoha.org%3A443%2Fannounce&amp;tr=https%3A%2F%2Ftracker.cyber-hub.net%3A443%2Fannounce&amp;tr=https%3A%2F%2Ftr.burnabyhighstar.com%3A443%2Fannounce"  length="1"  type="application/x-bittorrent" ></enclosure>
<author><![CDATA[nekomoekissaten]]></author>
<guid isPermaLink="true" >http://share.dmhy.org/topics/view/652613_10_Sousou_no_Frieren_01_1080p.html</guid>
<category domain="http://share.dmhy.org/topics/list/sort_id/2" ><![CDATA[動畫]]></category>
</item>
<item>
<title><![CDATA[【喵萌奶茶屋】★10月新番★[葬送的芙莉莲 / Sousou no Frieren][01][1080p][简日双语][招募翻译]]]></title>
<link>http://share.dmhy.org/topics/view/652596_10_Sousou_no_Frieren_01_1080p.html</link>
<pubDate>Wed, 04 Oct 2023 09:04:57 +0800</pubDate>
<description><![CDATA[<p><img src="https://s2.loli.net/2023/10/04/2YE8DWOANHUxJKf.png" /></p>
<hr />
<p><img src="https://nekomoe.pages.dev/images/mainVisual/char.jpg" /></p>
<hr />
<p>喵萌奶茶屋招募以下职位的小伙伴！</p>
<p>1.<strong>翻译</strong>：没有证书要求，能正确听译一集动画即可</p>
<p>2.<strong>时轴</strong>：使用 Aegisub 准确拉轴对帧并设置合适的样式、字体、屏幕字</p>
<p>3.<strong>后期</strong>：懂时轴基础知识并使用 Vapoursynth 或 Avisynth 内嵌字幕，做种发布分流</p>
<p>4.<strong>压制</strong>：能独立写代码优化画质并使用 VapourSynth 或 AviSynth 压制 BDRip / DVDRip</p>
<p>5.<strong>特效</strong>：熟练应用特效代码制作合适的歌词特效</p>
<p>6.<strong>画师</strong>：画海报、字幕娘、表情包、LOGO 等</p>
<p>7.<strong>分流</strong>：捐献服务器盒子永久保种本组合集资源</p>
<p>欢迎热爱二次元热衷字幕制作的小伙伴加入！申请请加入 QQ 群：421320480</p>
<p>粉丝群：477659567</p>
<hr />
<p>奶茶屋所有最新的【<a href="https://github.com/Nekomoekissaten/Nekomoekissaten-Subs" target="_blank" rel="external nofollow"><strong>外挂字幕</strong></a>】在这里，如果有对本组做过的番有兴趣的，欢迎来调 BD 轴！</p>
<p>本组发布的资源请以最新发布为准，最新的 TV 合集，最新的 BDRip 合集是最新修正的资源！</p>
<p>本组发布的外挂字幕请勿随意修改后发布至公网！</p>
<p>点击加入【<a href="https://jq.qq.com/?_wv=1027&amp;k=4ERTkKi" target="_blank" rel="external nofollow"><strong>奶茶分流小分队</strong></a>】，为自己喜爱的番奉献一份力量！</p>
<hr />
<p>从 2020 年 10 月新番起，本组发布的作品将去掉 Web 片源自带的片头！</p>]]></description>
<enclosure url="magnet:?xt=urn:btih:2MJ7G7ML6WYNVN3QXQ3SV4QUBUP2RW3I&amp;dn=&amp;tr=http%3A%2F%2F104.143.10.186%3A8000%2Fannounce&amp;tr=udp%3A%2F%2F104.143.10.186%3A8000%2Fannounce&amp;tr=http%3A%2F%2Ftracker.openbittorrent.com%3A80%2Fannounce&amp;tr=http%3A%2F%2Ftracker3.itzmx.com%3A6961%2Fannounce&amp;tr=http%3A%2F%2Ftracker4.itzmx.com%3A2710%2Fannounce&amp;tr=http%3A%2F%2Ftracker.publicbt.com%3A80%2Fannounce&amp;tr=http%3A%2F%2Ftracker.prq.to%2Fannounce&amp;tr=http%3A%2F%2Fopen.acgtracker.com%3A1096%2Fannounce&amp;tr=https%3A%2F%2Ft-115.rhcloud.com%2Fonly_for_ylbud&amp;tr=http%3A%2F%2Ftracker1.itzmx.com%3A8080%2Fannounce&amp;tr=http%3A%2F%2Ftracker2.itzmx.com%3A6961%2Fannounce&amp;tr=udp%3A%2F%2Ftracker1.itzmx.com%3A8080%2Fannounce&amp;tr=udp%3A%2F%2Ftracker2.itzmx.com%3A6961%2Fannounce&amp;tr=udp%3A%2F%2Ftracker3.itzmx.com%3A6961%2Fannounce&amp;tr=udp%3A%2F%2Ftracker4.itzmx.com%3A2710%2Fannounce&amp;tr=http%3A%2F%2Fnyaa.tracker.wf%3A7777%2Fannounce&amp;tr=http%3A%2F%2Ft.nyaatracker.com%2Fannounce&amp;tr=http%3A%2F%2Ft.acg.rip%3A6699%2Fannounce&amp;tr=http%3A%2F%2Ftr.bangumi.moe%3A6969%2Fannounce&amp;tr=http%3A%2F%2Fshare.camoe.cn%3A8080%2Fannounce&amp;tr=http%3A%2F%2Fsukebei.tracker.wf%3A8888%2Fannounce&amp;tr=http%3A%2F%2Fopenbittorrent.com%3A80%2Fannounce&amp;tr=https%3A%2F%2Fopentracker.i2p.rocks%3A443%2Fannounce&amp;tr=https%3A%2F%2Ftracker.nanoha.org%3A443%2Fannounce&amp;tr=https%3A%2F%2Ftracker.cyber-hub.net%3A443%2Fannounce&amp;tr=https%3A%2F%2Ftr.burnabyhighstar.com%3A443%2Fannounce"  length="1"  type="application/x-bittorrent" ></enclosure>
<author><![CDATA[nekomoekissaten]]></author>
<guid isPermaLink="true" >http://share.dmhy.org/topics/view/652596_10_Sousou_no_Frieren_01_1080p.html</guid>
<category domain="http://share.dmhy.org/topics/list/sort_id/2" ><![CDATA[動畫]]></category>
</item>
</channel>
</rss>`;

describe('DmhyParser', () => {
  let parser;

  beforeEach(() => {
    parser = new DmhyParser();
  });

  test('should parse all RSS items including the first one', () => {
    const items = parser.parse(sampleXml);

    expect(items).toHaveLength(66);
  });

  test('should correctly parse the first item (episode 31)', () => {
    const items = parser.parse(sampleXml);
    const firstItem = items[0];

    expect(firstItem.title).toContain('[31]');
    expect(firstItem.title).toBe('【喵萌奶茶屋】★01月新番★[葬送的芙莉蓮 / Sousou no Frieren][31][1080p][繁日雙語][招募翻譯]');
    expect(firstItem.link).toBe('http://share.dmhy.org/topics/view/712650_01_Sousou_no_Frieren_31_1080p.html');
    expect(firstItem.author).toBe('nekomoekissaten');
    expect(firstItem.category).toBe('動畫');
    expect(firstItem.magnetLink).toContain('magnet:?xt=urn:btih:JUK57T36TXYRDIZZYDFS4N3MKEQWL3R3');
    expect(firstItem.guid).toBeDefined();
    expect(firstItem.publishedDate).toBeInstanceOf(Date);
  });

  test('should correctly parse the second item (episode 31 simplified Chinese)', () => {
    const items = parser.parse(sampleXml);
    const secondItem = items[1];

    // Second item is Episode 31 in Simplified Chinese
    expect(secondItem.title).toContain('[31]');
    expect(secondItem.title).toBe('【喵萌奶茶屋】★01月新番★[葬送的芙莉莲 / Sousou no Frieren][31][1080p][简日双语][招募翻译]');
    expect(secondItem.link).toBe('http://share.dmhy.org/topics/view/712649_01_Sousou_no_Frieren_31_1080p.html');
    expect(secondItem.author).toBe('nekomoekissaten');
    expect(secondItem.category).toBe('動畫');
  });

  test('should handle XML with newlines between tags and CDATA', () => {
    // This test verifies the fix for the bug where regex couldn't handle:
    // <title>
    // <![CDATA[ ... ]]>
    // </title>
    const items = parser.parse(sampleXml);

    expect(items.length).toBeGreaterThan(0);
    expect(items[0].title).not.toBe('');
    expect(items[0].description).not.toBe('');
  });

  test('should generate valid GUID for each item', () => {
    const items = parser.parse(sampleXml);

    items.forEach(item => {
      expect(item.guid).toBeDefined();
      expect(typeof item.guid).toBe('string');
      expect(item.guid.length).toBe(32); // MD5 hash length
    });
  });

  test('should parse dates correctly', () => {
    const items = parser.parse(sampleXml);

    items.forEach(item => {
      expect(item.publishedDate).toBeInstanceOf(Date);
      expect(item.publishedDate.getTime()).not.toBeNaN();
    });
  });
});

// Run tests if this file is executed directly
if (require.main === module) {
  const items = parser.parse(sampleXml);

  console.log('Total items parsed:', items.length);
  console.log('\nParsed items:');
  items.forEach((item, index) => {
    console.log(`\n[${index + 1}] ${item.title}`);
    console.log(`   Episode: ${item.title.match(/\[(\d+)\]/)?.[1] || 'N/A'}`);
    console.log(`   Link: ${item.link}`);
    console.log(`   GUID: ${item.guid}`);
    console.log(`   Magnet: ${item.magnetLink.substring(0, 50)}...`);
    console.log(`   Author: ${item.author}`);
    console.log(`   Category: ${item.category}`);
  });

  // Verify all items are parsed
  if (items.length === 2 && items[0].title.includes('[31]')) {
    console.log('\n✅ SUCCESS: All tests passed!');
    process.exit(0);
  } else {
    console.log('\n❌ ERROR: Tests failed!');
    process.exit(1);
  }
}
