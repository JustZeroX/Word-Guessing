import { chatCompletions, createEmbedding } from '../../lib/api/llmApi'
import { encryptTargetWord } from '../../lib/utils/crypto'

function getDifficultyProfile(floor) {
  if (floor <= 10) return { scope: '日常具象名词或动词', theme: '日常词汇' }
  if (floor <= 30) return { scope: '抽象名词，2-4 字', theme: '抽象概念' }
  if (floor <= 50) return { scope: '医疗、经济、天文学等领域词', theme: '领域词汇' }
  return { scope: '生僻词、成语，难度极高', theme: '极限挑战' }
}

function extractPayload(response, fallbackTheme) {
  const raw = response?.choices?.[0]?.message?.content ?? ''
  const normalized = raw.trim()

  try {
    const parsed = JSON.parse(normalized)
    const word = String(parsed.word || '').trim().replace(/[，。！？；：,.!?;:]/g, '')
    const clue = String(parsed.clue || '').trim()
    return { word, clue: clue || `与 ${fallbackTheme} 相关` }
  } catch {
    const safeWord = normalized
      .replace(/```json|```/g, '')
      .trim()
      .replace(/[，。！？；：,.!?;:]/g, '')
    return { word: safeWord, clue: `与 ${fallbackTheme} 相关` }
  }
}

function pickValidWord(rawWord = '') {
  const cleaned = String(rawWord)
    .replace(/```json|```/g, '')
    .replace(/["'`]/g, '')
    .replace(/[，。！？；：,.!?;:]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  if (!cleaned) return ''

  const quotedMatch = cleaned.match(/[一-龥]{1,8}/g)
  if (!quotedMatch?.length) return ''

  const candidate = quotedMatch.find((token) => token.length >= 1 && token.length <= 8) || ''
  if (!candidate) return ''

  const obviousTraditional = /[學體臺萬與專業東絲兩嚴喪豐臨為麗舉麼義烏樂喬習鄉書買亂乾爭於虧雲亞產畝親複餘侶俠側偵偽傘備傢傭傳傷倫偉倉個們價儀優會傴債傾僅億儉償儲兒兇兌蘭關興兵冊寫軍農冪凍凜凱別劃劉則剛創刪剎剝劇劍劑務勁勞勢勵勸勻匯區協單賣南博卻廠廈廚廢廣庫應廟廠廳弒張彌彎彙彆徑從徠復徵德憂懷態慶憐憑懶戲戰戶拋挾捨據掙掛採揚換擇擴擾攝攜數敵斂斃斕斷旂時晉晝曉暈曬書會條來東殺權桿桿夢機橋檢樓標樣樹歐歲歷歸殘殼毀氣氫漢湯灣濃濕濟濤濫濰濱灃灕無煙煉煩熱獨獄獅獎獵獻環現瑪瑋產畫異當疊癆療癢瘋癥發盜監盤眾睜瞭矚礙礦碼磚礬祿禮禍離稅種稱穀窩窮竄競筆節範築篩簾籃糾紀紗紅紡線練組細終絆紹經絕統絲絨結給絞絡絢統絹綁綉綜綠維綱網綴綵緊緋緒線緣編緩緬縣縱縴總績織繩繪繫續纜缽罐羅罰羆羥習翹聖聞聯聰聲聳職聶膽脅腎腖腦腳腫臘與興舉舊艙艦艱艶藝節芻苧茲荊莊華萊萬葉著葯蒼蓋藍蘇處虛號蠟蠶補裝複襲見規視覽覺觸譯證譽讀變讓識該詳語誤說説誰課調諸諾謀謊謎謨謝謠謹譜譴穫贊賬賭賴贈贊贓趕趙趨躍躡車軌軋軍軒軟較載輕輔輛輝輩輪輯輸轄辦辭辯農邊遙遞遺鄒鄰醜醫釀釋針鈍鈔鐘鋼錄錢錦錨鍋鍊鎖鏈鏟鐵鑰鑒長門閃閉問閩閱闊隊陽陰階際陣陳陸險隱隸雜雙雞難雲靈靚靜靨韋韓頁頂頃項順須頑頒預頓頗領頸頜頡顆額顏顧顯風颯飄飛餅養餘館驀驅驕驗驚骯髒髮鬥鬧魯鮑鮮鯉鯨鳥鳳鳴鴨鹹鹽麗麥黃點黨齊齒龐龜]/u
  if (obviousTraditional.test(candidate)) return ''

  return candidate
}

function normalizeWordForCompare(word = '') {
  return String(word).trim()
}

export async function generateLevel(settings, floor, options = {}) {
  const { excludedWords = [] } = options
  const difficulty = getDifficultyProfile(floor)
  const excludedSet = new Set(
    excludedWords.map((word) => normalizeWordForCompare(word)).filter(Boolean),
  )
  let word = ''
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const avoidWords = Array.from(excludedSet).slice(0, 24).join('、')
    const avoidPrompt = avoidWords ? `禁止使用这些词：${avoidWords}。` : ''
    const response = await chatCompletions(settings, [
      {
        role: 'system',
        content:
          '你是猜词游戏出题器。请严格输出 JSON：{"word":"词汇","clue":"不泄露答案的提示"}。word 必须是 1-8 个字的简体中文常用词，不允许句子、繁体字、英文、数字。clue 禁止出现目标词任意字。',
      },
      {
        role: 'user',
        content: `请给我一个第 ${floor} 关可用词汇。难度要求：${difficulty.scope}。${avoidPrompt}请输出 JSON，不要附加其他文本。`,
      },
    ])

    const payload = extractPayload(response, difficulty.theme)
    const validWord = pickValidWord(payload.word)
    const normalizedValidWord = normalizeWordForCompare(validWord)
    if (normalizedValidWord && !excludedSet.has(normalizedValidWord)) {
      word = validWord
      break
    }
  }

  if (!word) throw new Error('大模型返回的谜底格式不正确或重复，请重试。')

  const embeddingData = await createEmbedding(settings, word)
  const targetVector = embeddingData?.data?.[0]?.embedding
  if (!targetVector) throw new Error('未获取到目标词向量，请检查 Embedding 模型配置。')

  const encryptedTargetWord = encryptTargetWord(word)
  const clue = `🏷️ 提示：${[...word].length}个字`

  return {
    generatedWord: word,
    floor,
    encryptedTargetWord,
    targetVector,
    clue,
    lastGuessWord: '',
    guesses: [],
  }
}
