import { AutoCompleteEngineOffline } from "../src/AutoCompleteEngine/AutoCompleteEngineOffline";

describe("offline-engine [PLAIN] async", () => {
    let candiates = [{ text: "a" }, { text: "aa" }, { text: "b" }]

    it("simple case", (done) => {
      const engine = new AutoCompleteEngineOffline(candiates)
      engine.getRecommendationList("a", 10).subscribe((list) => {
        expect(list).toEqual([{ text: "a" }, { text: "aa" }]);
        done();
      })
    });
    it("simple case 2", (done) => {
      const engine = new AutoCompleteEngineOffline(candiates)
      engine.getRecommendationList("aa", 10).subscribe((list) => {
        expect(list).toEqual([{ text: "aa" }]);
        done();
      })
    });
    it("selection of matchers", (done) => {
      const engine = new AutoCompleteEngineOffline(candiates)
      engine.getRecommendationList("a", 1).subscribe((list) => {
        expect(list).toEqual([{ text: "a" }]);
        done();
      })
    });
    it("with zero match", (done) => {
      const engine = new AutoCompleteEngineOffline([{ text: "b" }, { text: "c" }])
      engine.getRecommendationList("a", 10).subscribe((list) => {
        expect(list).toEqual([]);
        done();
      })
    });
    it("with empty array", (done) => {
      const engine = new AutoCompleteEngineOffline([])
      engine.getRecommendationList("a", 10).subscribe((list) => {
        expect(list).toEqual([]);
        done();
      })
    });
})