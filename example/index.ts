import { AutoCompleteItem } from "../src/defs";
import { Subject } from "rxjs";
import { AutoCompleteEngineOffline } from "../src/AutoCompleteEngine/AutoCompleteEngineOffline";
import { AutocompleteController } from "../src/AutoCompleteController";

function displayAutoCompleteItems(items: AutoCompleteItem[]) {
    const $list = document.getElementById("list")
    while ($list.firstChild) {
      $list.removeChild($list.firstChild);
    }
    items.forEach(item => {
      const node = document.createElement("li");
      const textnode = document.createTextNode(item.text);
      node.appendChild(textnode);
      $list.appendChild(node);
    });
}

const candiates = [{ text: "a" }, { text: "aa" }, { text: "b" }, { text: "aab" }, { text: "aabbc" }]

const $inputElement = <HTMLInputElement>document.getElementById("input-with-autocomplete")
const inputPayload$ = new Subject<string>()
const engine = new AutoCompleteEngineOffline(candiates)
const controller = new AutocompleteController(engine, displayAutoCompleteItems, inputPayload$)

$inputElement.addEventListener('keyup', (event) => {
    console.log('next', $inputElement.value)
    inputPayload$.next($inputElement.value)
});
