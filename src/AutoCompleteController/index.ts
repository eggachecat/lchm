
import { Observable, Subject, Subscription, interval, merge } from 'rxjs'
import { mapTo } from 'rxjs/operators'
import { BaseAutoCompleteEngine, AutoCompleteItem } from '../defs'
export class AutocompleteController {
  /**
   * 每次用户输入任意值，都会从 payload$ 流中获得
   * 比如，用户依次输入 a, b, c
   * 那么 payload$ 流会获得三个值："a", "ab", "abc"
   */
  payload$: Subject<string>

  subscription: Subscription

  patience: number  // 等待时间
  maxStrLen: number// 最大的长度
  lastInputDate: number = 0 // timestamp
  lastUpdateDate: number = 0 // timestamp
  lastInput: string
  searchSubStack: Subscription[] = [] // 订阅的历史 最新的在最前面!
  top: number
  engine: BaseAutoCompleteEngine
  updateSearchResultsCallback: (items: AutoCompleteItem[]) => (void)
  isShown: boolean = false

  constructor (engine: BaseAutoCompleteEngine, updateSearchResultsCallback: (items: AutoCompleteItem[]) => (void),
    payload$: Subject<string>, top: number = 10, patience: number = 500, maxStrLen: number = 30) {
    this.engine = engine
    this.patience = patience
    this.maxStrLen = maxStrLen
    this.updateSearchResultsCallback = updateSearchResultsCallback
    this.top = top
    this.payload$ = payload$
    this.subscription = this.getAutoSearch().subscribe()
  }

  // 更新 Input 框中的搜索词
  setSearchStr: (str: string) => void
  // 更新搜索状态
  setLoading: (isLoading: boolean) => void
  // 显示或隐藏警告信息
  toggleWarning (isShown?: boolean) {
    this.isShown = isShown
  }
  // 发送请求，获取搜索结果
  searchQuery (str: string): Observable<AutoCompleteItem[]> {
    return this.engine.getRecommendationList(str, this.top)
  }
  // 更新搜索结果列表
  setSearchResults (items: AutoCompleteItem[]): void {
    this.updateSearchResultsCallback(items)
  }

  // 你要实现的方法
  getAutoSearch (): Observable<any> {
    // 确保this不要混淆了
    const self = this

    const search$ = (
      new Observable((observer: any) => {
        const timer = interval(self.patience)
        const __IMPOSSIBLE_STRING_TIME_UP__: string = '__IMPOSSIBLE_STRING_TIME_UP__'

        function cancelPreviousRequests (startIndex: number = 0) {
          for (let index = startIndex; index < self.searchSubStack.length; index++) {
            const subscription = self.searchSubStack.pop()
            subscription.unsubscribe()
          }
        }

        function tryNewSearchRequest (now: number, x: string) {
          cancelPreviousRequests()// 确保清空
          if (x.length > self.maxStrLen) {
            // 取消所有请求 <=> 把0开始后面的全部取消
            self.toggleWarning(true)
            return
          }
          // 长度合法了,不需要提示了
          self.toggleWarning(false)
          self.lastUpdateDate = now // 确保时间上的同步

          // 2.如果请求没有返回时，用户就再次输入，要取消之前的请求
          const subscription = self.searchQuery(x).subscribe(
            (items: AutoCompleteItem[]) => {
              // 确保是最新的 -> 用scope中的now和全局的lastUpdateDate一样来确保这一件事
              // 因为取消的时候也可能还没有取消就subscribe到了(也许?)
              if (now === self.lastUpdateDate) self.setSearchResults(items)
            },
            (error: any) => console.log('searchQuery.subscribe Error: ' + error),
            () => console.log('searchQuery.subscribe Completed')
          )
          // head!!
          self.searchSubStack.unshift(subscription)
        }

        merge(self.payload$, timer.pipe(mapTo(__IMPOSSIBLE_STRING_TIME_UP__))).subscribe(
          (x: string) => {
            const now = Date.now()

            if (x === __IMPOSSIBLE_STRING_TIME_UP__) {
              // 意味着检查期到!
              if (self.lastInputDate !== self.lastUpdateDate) {
                // 最后一次输入距离倒数第二次输入<500ms
                // 且过了500ms还没有输入
                console.log('TIME-UP-AND-TRY', self.lastInput)
                tryNewSearchRequest(now, self.lastInput)
                self.lastInputDate = self.lastUpdateDate // 为了定时器
              }
              return
            }

            self.lastInputDate = now
            self.lastInput = x
            // 1.用户停止输入 500ms 后，再发送请求
            if (now - self.lastUpdateDate < self.patience) return
            // 4.如果用户输入超过 30 个字符，取消所有请求，并显示提示：您输入的字符数过多。
            // if (x.length > self.maxStrLen) {
            //     // 取消所有请求 <=> 把0开始后面的全部取消
            //     self.toggleWarning(true)
            //     cancelPreviousRequests()
            //     return
            // }
            // // 长度合法了,不需要提示了
            // self.toggleWarning(false)
            // self.lastUpdateDate = self.lastInputDate // 为了定时器

            tryNewSearchRequest(now, x)

            // // 2.如果请求没有返回时，用户就再次输入，要取消之前的请求
            // cancelPreviousRequests()// 确保清空

            // const subscription = self.searchQuery(x).subscribe(
            //     (items: AutoCompleteItem[]) => {
            //       // 确保是最新的 -> 用scope中的now和全局的lastInputDate一样来确保这一件事
            //       // 因为取消的时候也可能还没有取消就subscribe到了(也许?)
            //       if (now === self.lastInputDate) self.setSearchResults(items)
            //     },
            //     (error: any) => console.log('searchQuery.subscribe Error: ' + error),
            //     () => console.log('searchQuery.subscribe Completed')
            // )
            // // head!!
            // self.searchSubStack.unshift(subscription)

          },
          (error: any) => console.log('payload$.subscribe Error: ' + error),
          () => console.log('payload$.subscribe Completed')
        )
      })
    )
    console.log('returned', search$)
    return search$
  }
}
