import { Observable, Subject, Subscription } from 'rxjs'
import { AutoCompleteItem, BaseAutoCompleteEngine } from '../defs'
type RecommendationAlgorithm = 'PLAIN' | 'EDITDISTANCE' | 'COMPLEX'

export class AutoCompleteEngineOffline extends BaseAutoCompleteEngine {
  hotnessMutiplier: number // hotness
  candidates: AutoCompleteItem[]
  scoreMode: RecommendationAlgorithm
  constructor (candidates: AutoCompleteItem[], hotnessMutiplier: number = 0, scoreMode: RecommendationAlgorithm = 'PLAIN') {
    super()
    this.hotnessMutiplier = hotnessMutiplier
    this.scoreMode = scoreMode
    this.candidates = candidates
  }
  _PLAIN_getRecommendationList (keyword: string, top: number): AutoCompleteItem[] {
    const scores = new Map<number, number>()
    function getScore (o: { i: number, v: AutoCompleteItem }): number {
        // 自己定义给字符串打分的函数
        // 如果不匹配,分数为0,否则分数为长度
        // keyword="aa" str="aaab" => 首先存在 => 然后候选长度是4 => score=4
      const score = o.v.text.indexOf(keyword) === -1 ? 0 : o.v.text.length
      scores.set(o.i, score)
      return score
    }

    return this.candidates.map((v, i) => { return { i: i, v: v } }).sort((a, b) => {
        // 排序函数,依据分数来,算过的不用再算一边
      return (scores.has(a.i) ? scores.get(a.i) : getScore(a)) - (scores.has(b.i) ? scores.get(b.i) : getScore(b))
    }).filter(o => scores.get(o.i) > 0).map(o => o.v).slice(0, top)
  }

  _PLAIN_getRecommendationList$ (keyword: string, top: number): Observable<AutoCompleteItem[]> {
    let observable = new Subject<AutoCompleteItem[]>()
      // 强行observable
    setTimeout(() => {
      observable.next(this._PLAIN_getRecommendationList(keyword, top))
      observable.complete()
    })
    return observable
  }
  getRecommendationList (keyword: string, top: number = 10): Observable<AutoCompleteItem[]> {
    switch (this.scoreMode) {
      case 'PLAIN':
        return this._PLAIN_getRecommendationList$(keyword, top)
      default:
        break
    }
  }
}
