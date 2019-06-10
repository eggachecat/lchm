import { AutocompleteController } from "../src/AutoCompleteController";
import { AutoCompleteEngineOffline } from "../src/AutoCompleteEngine/AutoCompleteEngineOffline";
import { AutoCompleteItem } from "../src/defs";
import { Subject } from "rxjs";
describe("controller with offline-engine [PLAIN]", () => {
    const candiates = [{ text: "a" }, { text: "aa" }, { text: "b" }, { text: "aab" }, { text: "aabbc" }]
    const makeCompareFn = function (done: jest.DoneCallback, total: number, expectItems: AutoCompleteItem[][]): (items: AutoCompleteItem[]) => (void) {
      let index = 0
      return (items: AutoCompleteItem[]) => {
        console.log('Expect', index)
        expect(items).toEqual(expectItems[index])
        index++;
        if (index == total) {
            done()
        }
      }
    }
    const mockInput = function (payload$: Subject<string>, settings: { text: string, waitTime: number }[]) {
      const length = settings.length
      let index = 0
      function recursiveTimeout() {
        setTimeout(() => {
            payload$.next(settings[index].text)
            index++
            if (index < length) {
              recursiveTimeout()
            } else {
              payload$.complete()
            }
        }, settings[index].waitTime)
      }
      recursiveTimeout()
    }

    it("simple case", (done) => {
      const engine = new AutoCompleteEngineOffline(candiates)
      const payload$ = new Subject<string>()
      const expectItems = [[{ text: "a" }, { text: "aa" }, { text: "aab" }, { text: "aabbc" }], [{ text: "aa" }, { text: "aab" }, { text: "aabbc" }]]
      const controller = new AutocompleteController(engine, makeCompareFn(done, 2, expectItems), payload$)
      mockInput(payload$, [{ text: "a", waitTime: 0 }, { text: "aa", waitTime: 1000 }])
    });
    it("ignore 2nd", (done) => {
      const engine = new AutoCompleteEngineOffline(candiates)
      const payload$ = new Subject<string>()
      const expectItems = [
        [{ text: "a" }, { text: "aa" }, { text: "aab" }, { text: "aabbc" }],
        []
      ]
      const controller = new AutocompleteController(engine, makeCompareFn(done, 2, expectItems), payload$)
      mockInput(payload$, [{ text: "a", waitTime: 0 }, { text: "aa", waitTime: 100 }, { text: "f", waitTime: 100 }])
    });
    it("1st then delay 2nd then valid 3rd delay 4th", (done) => {
      const engine = new AutoCompleteEngineOffline(candiates)
      const payload$ = new Subject<string>()
      const expectItems = [
        [{ text: "a" }, { text: "aa" }, { text: "aab" }, { text: "aabbc" }], // for "a" from input
        [{ text: "aa" }, { text: "aab" }, { text: "aabbc" }],// for "aa" from time-up
        [{ text: "aab" }, { text: "aabbc" }], // for "aab" from time-up
        [] // for "f" from time-up
      ]
      const controller = new AutocompleteController(engine, makeCompareFn(done, 4, expectItems), payload$)
      mockInput(payload$, [{ text: "a", waitTime: 0 }, { text: "aa", waitTime: 100 }, { text: "aab", waitTime: 1000 }, { text: "f", waitTime: 100 }])
    });
})

describe("trivial", () => {
    it("simple case", () => { })
})