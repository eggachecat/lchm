import { Observable, Subject } from 'rxjs'
// var observable = Observable.create((observer: any) => {
//     observer.next('Hello World!');
//     observer.next('Hello Again!');
//     observer.complete();
//     observer.next('Bye');
// })

let observable = new Subject<any>()

// setInterval(() => {
//     observable.next(`Hello World! ${new Date}`);
// }, 1000)

setTimeout(() => {
  observable.next('Hello World!')
  observable.next('Hello Again!')
  observable.complete()
  observable.next('Bye')
})

observable.subscribe(
    (x: any) => logItem(x),
    (error: any) => logItem('Error: ' + error),
    () => logItem('Completed')
)
function logItem (val: any) {
  let node = document.createElement('li')
  let textnode = document.createTextNode(val)
  node.appendChild(textnode)
  document.getElementById('list').appendChild(node)
}
