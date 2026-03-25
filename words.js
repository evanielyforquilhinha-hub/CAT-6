// 六级核心词库升级版 (包含丰富变形与形近词)
const allWords = [
    { 
        id: 1, word: "abandon", phonetic: "/əˈbændən/", 
        hintSentence: "The company was forced to abandon its ambitious expansion plan.", 
        pos: "v.", meaning: "放弃，抛弃；沉溺于", usage: "abandon oneself to (沉溺于)", 
        forms: "【名词】abandonment (放弃) | 【形近词】abundant (大量的)", 
        cetSentences: "Many traditional practices have been abandoned in modern society." 
    },
    { 
        id: 2, word: "accumulate", phonetic: "/əˈkjuːmjəleɪt/", 
        hintSentence: "Toxic chemicals tend to accumulate in the human body over time.", 
        pos: "v.", meaning: "积累，积聚", usage: "accumulate wealth/evidence (积累财富/证据)", 
        forms: "【名词】accumulation | 【形容词】accumulative | 【形近词】accommodate (容纳，适应)", 
        cetSentences: "Evidence has been accumulating to support this controversial theory." 
    },
    { 
        id: 3, word: "abundant", phonetic: "/əˈbʌndənt/", 
        hintSentence: "The region offers an abundant supply of renewable energy.", 
        pos: "adj.", meaning: "大量的，充足的，丰富的", usage: "be abundant in (富于...)", 
        forms: "【名词】abundance (丰富，充裕) | 【副词】abundantly | 【形近词】abandon (放弃)", 
        cetSentences: "The country is abundant in natural resources but lacks technology." 
    },
    { 
        id: 4, word: "accelerate", phonetic: "/əkˈseləreɪt/", 
        hintSentence: "The new policy will significantly accelerate economic recovery.", 
        pos: "v.", meaning: "加速，促进", usage: "accelerate the pace of (加快...的步伐)", 
        forms: "【名词】acceleration (加速) | 【形近词】exhilarate (使高兴)", 
        cetSentences: "The government needs to accelerate economic growth to create jobs." 
    },
    { 
        id: 5, word: "barrier", phonetic: "/ˈbæriər/", 
        hintSentence: "Cultural differences can sometimes act as a communication barrier.", 
        pos: "n.", meaning: "障碍，屏障", usage: "break down barriers (打破障碍)", 
        forms: "【同义词】obstacle, hindrance | 【形近词】barrel (桶)", 
        cetSentences: "Lack of confidence is a major psychological barrier to success." 
    },
    { 
        id: 6, word: "campaign", phonetic: "/kæmˈpeɪn/", 
        hintSentence: "The organization launched a nationwide campaign to promote health.", 
        pos: "n./v.", meaning: "运动，战役；发起运动", usage: "launch a campaign (发起一场运动)", 
        forms: "【名词】campaigner (活动家) | 【形近词】champion (冠军，拥护)", 
        cetSentences: "They started a campaign to save the endangered environment." 
    },
    { 
        id: 7, word: "decline", phonetic: "/dɪˈklaɪn/", 
        hintSentence: "There has been a steady decline in the local population.", 
        pos: "v./n.", meaning: "下降，衰退；婉拒", usage: "a sharp decline in (在...方面的急剧下降)", 
        forms: "【形近词】incline (倾斜，倾向) | recline (向后靠)", 
        cetSentences: "The number of students applying for the course has declined." 
    },
    { 
        id: 8, word: "elaborate", phonetic: "/ɪˈlæbərət/", 
        hintSentence: "The manager asked her to elaborate on the proposed marketing strategy.", 
        pos: "adj./v.", meaning: "精心制作的，详尽的；详细阐述", usage: "elaborate on sth. (详细说明某事)", 
        forms: "【名词】elaboration | 【副词】elaborately | 【形近词】evaluate (评估)", 
        cetSentences: "He didn't elaborate on the details of the agreement." 
    },
    { 
        id: 9, word: "facilitate", phonetic: "/fəˈsɪlɪteɪt/", 
        hintSentence: "Modern technology has done much to facilitate global communication.", 
        pos: "v.", meaning: "促进，使便利", usage: "facilitate the development (促进发展)", 
        forms: "【名词】facility (设施) / facilitation | 【形近词】fascinate (使着迷)", 
        cetSentences: "The new airport will facilitate economic growth in the region." 
    },
    { 
        id: 10, word: "genuine", phonetic: "/ˈdʒenjuɪn/", 
        hintSentence: "The document is believed to be a genuine historical artifact.", 
        pos: "adj.", meaning: "真正的，真诚的", usage: "genuine concern (真诚的关心)", 
        forms: "【名词】genuineness | 【副词】genuinely | 【形近词】genius (天才)", 
        cetSentences: "She showed genuine interest in the charitable project." 
    },
    { 
        id: 11, word: "ignorant", phonetic: "/ˈɪɡnərənt/", 
        hintSentence: "Many people remain entirely ignorant of their basic legal rights.", 
        pos: "adj.", meaning: "无知的，愚昧的；不知道的", usage: "be ignorant of (对...一无所知)", 
        forms: "【名词】ignorance (无知) | 【动词】ignore (忽视) | 【形近词】arrogant (傲慢的)", 
        cetSentences: "We cannot remain ignorant of the environmental problems." 
    },
    { 
        id: 12, word: "legislation", phonetic: "/ˌledʒɪsˈleɪʃn/", 
        hintSentence: "New legislation will be introduced to protect consumer privacy.", 
        pos: "n.", meaning: "法律，法规，立法", usage: "pass legislation (通过立法)", 
        forms: "【动词】legislate | 【形容词】legislative | 【形近词】legitimate (合法的)", 
        cetSentences: "The government has promised to introduce new legislation." 
    },
    { 
        id: 13, word: "maintain", phonetic: "/meɪnˈteɪn/", 
        hintSentence: "It is difficult to maintain a healthy diet when traveling frequently.", 
        pos: "v.", meaning: "维持，保持；维修；坚持认为", usage: "maintain a balance (保持平衡)", 
        forms: "【名词】maintenance (维护，保养) | 【形近词】contain (包含) | retain (保留)", 
        cetSentences: "The company failed to maintain its competitive advantage." 
    },
    { 
        id: 14, word: "obscure", phonetic: "/əbˈskjʊər/", 
        hintSentence: "The origins of the tradition remain obscure to most historians.", 
        pos: "adj./v.", meaning: "模糊的，默默无闻的；遮掩", usage: "remain obscure (保持默默无闻/不为人知)", 
        forms: "【名词】obscurity (模糊，默默无闻) | 【形近词】observe (观察)", 
        cetSentences: "The details of his early life remain obscure." 
    },
    { 
        id: 15, word: "perspective", phonetic: "/pərˈspektɪv/", 
        hintSentence: "Traveling abroad can significantly broaden your perspective on life.", 
        pos: "n.", meaning: "视角，观点；透视法", usage: "from a global perspective (从全球视角)", 
        forms: "【形容词】perspectival | 【形近词】prospective (预期的，未来的)", 
        cetSentences: "We need to look at the issue from a different perspective." 
    },
    { 
        id: 16, word: "radical", phonetic: "/ˈrædɪkl/", 
        hintSentence: "The company is planning radical changes to its management structure.", 
        pos: "adj./n.", meaning: "根本的，彻底的，激进的", usage: "radical reform (激进的改革)", 
        forms: "【副词】radically (根本地) | 【形近词】radiation (辐射) | racial (种族的)", 
        cetSentences: "There is a need for radical changes in the education system." 
    },
    { 
        id: 17, word: "substitute", phonetic: "/ˈsʌbstɪtuːt/", 
        hintSentence: "Honey can be used as a healthy substitute for sugar in this recipe.", 
        pos: "n./v.", meaning: "代替品，代替者；代替", usage: "substitute A for B (用A代替B)", 
        forms: "【名词】substitution (代替) | 【形近词】institute (建立，机构) | constitute (构成)", 
        cetSentences: "Nothing can substitute for hard work and persistence." 
    },
    { 
        id: 18, word: "transform", phonetic: "/trænsˈfɔːrm/", 
        hintSentence: "The internet has completely transformed the way we communicate.", 
        pos: "v.", meaning: "改变，使变形，转换", usage: "transform into (转变成)", 
        forms: "【名词】transformation (转变) | 【形近词】transfer (转移) | transmit (传输)", 
        cetSentences: "Education has the power to transform people's lives." 
    },
    { 
        id: 19, word: "vacant", phonetic: "/ˈveɪkənt/", 
        hintSentence: "There are several vacant positions in the marketing department.", 
        pos: "adj.", meaning: "空缺的，空闲的，茫然的", usage: "vacant seat/position (空座/空缺职位)", 
        forms: "【名词】vacancy (空缺) | 【形近词】vacuum (真空，吸尘器) | vacation (假期)", 
        cetSentences: "The hospital has no vacant beds for new patients." 
    },
    { 
        id: 20, word: "widespread", phonetic: "/ˈwaɪdspred/", 
        hintSentence: "The announcement caused widespread panic among the investors.", 
        pos: "adj.", meaning: "分布广的，普遍的，广泛的", usage: "widespread concern/support (广泛的关注/支持)", 
        forms: "【同义词】prevalent, universal | 【形近词】outspread (伸开的)", 
        cetSentences: "There is widespread concern about the rising cost of living." 
    }
];