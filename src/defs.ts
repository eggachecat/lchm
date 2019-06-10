import { Observable, Subject, Subscription } from 'rxjs'

export interface AutoCompleteItem {
  text: string,
  id?: number
  hotness?: number
}

export abstract class BaseAutoCompleteEngine {
  abstract getRecommendationList (keyword: string, top: number): Observable<AutoCompleteItem[]>
}
