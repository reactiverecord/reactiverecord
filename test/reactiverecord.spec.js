// import { expect } from "chai"
// import { ReactiveRecord, Model } from "../src"
//
// describe("ReactiveRecord", ()=>{
//   describe("#model", ()=>{
//
//     it("should add a new Model to the ReactiveRecord instance", ()=>{
//       const reactiveRecordTest = new ReactiveRecord();
//       reactiveRecordTest.model("Person", class extends Model {
//         static schema = {
//           name: String
//         }
//       });
//       expect(reactiveRecordTest.models).to.have.property("Person")
//     });
//
//     it("should assign models a unique instance", () => {
//       const reactiveRecordTest = new ReactiveRecord(),
//             reactiveRecordTest2 = new ReactiveRecord();
//       reactiveRecordTest.model("Person", class extends Model {
//         static schema = {
//           name: String
//         }
//       });
//       reactiveRecordTest2.model("Person", class extends Model {
//         static schema = {
//           name: String
//         }
//       });
//       reactiveRecordTest2.model("Place", class extends Model {
//         static schema = {
//           name: String
//         }
//       });
//
//       const instanceOne = reactiveRecordTest.model("Person").ReactiveRecord,
//             instanceTwo = reactiveRecordTest2.model("Person").ReactiveRecord,
//             placeInstance = reactiveRecordTest2.model("Place").ReactiveRecord;
//
//       expect(instanceOne).to.not.be.undefined;
//       expect(instanceOne).to.not.equal(instanceTwo);
//       expect(instanceTwo).to.equal(placeInstance);
//     })
//
//   });
//
//   describe("#setAPI", ()=>{
//     const reactiveRecordTest = new ReactiveRecord();
//
//     reactiveRecordTest.setAPI({ headers: {
//       "Accept": "text/plain",
//       "JWT_TOKEN": "thetoken"
//     }});
//
//     it("should merge API request headers with the default headers", ()=>{
//       expect(reactiveRecordTest.API.headers["Content-Type"]).to.equal("application/json")
//       expect(reactiveRecordTest.API.headers["JWT_TOKEN"]).to.equal("thetoken")
//     });
//     it("should leave default API request properties alone if unspecified", ()=>{
//       expect(reactiveRecordTest.API.prefix).to.equal("")
//     });
//   });

  // describe("#getRoute", ()=>{
  //   const reactiveRecordTest = new ReactiveRecord();
  //   class Person extends Model {
  //     static schema = { name: String, age: Number }
  //     static routes = { except: "DELETE", POST: "/correct-route/:id" }
  //   }
  //   reactiveRecordTest.model(Person);;
  //   it("should throw an error if a forbidden method is attempted", ()=>{
  //     expect(()=>{ reactiveRecordTest.getRoute(Person, "DELETE", { name: "Jim" }) }).to.throw(TypeError)
  //   });
  //   it("should generate the correct route", ()=>{
  //     expect(reactiveRecordTest.getRoute(Person, "PUT", { name: "Jim", id:"123" })).to.equal("/people/123")
  //   });
  //   it("should use a route specified in the model definition", ()=>{
  //     expect(reactiveRecordTest.getRoute(Person, "POST", { name: "Jim", id:"123" })).to.equal("/correct-route/123")
  //   });
  //   it("should add a query string to the route if a query string is specified", ()=>{
  //     expect("/correct-route/123?word=up").to.equal(reactiveRecordTest.getRoute(Person, "POST", { name: "Jim", id:"123" },"?word=up"))
  //   });
  //   it("should add a query string to the route if an object was given as the query argument", ()=>{
  //     const obj = { cool:"story", bro:"tell", it:"again", search:"Whoa! This was so cooL!<div></div>" },
  //           queryString = "?cool=story&bro=tell&it=again&search=Whoa!%20This%20was%20so%20cooL!%3Cdiv%3E%3C%2Fdiv%3E"
  //     expect(`/correct-route/123${queryString}`).to.equal(reactiveRecordTest.getRoute(Person, "POST", { name: "Jim", id:"123" }, obj))
  //   });
  // });

  
// });

// it("should add to query string for every type of operation where the attribute does not exist", () => {
//   reactiveRecordTest.dispatch.reset();
// });
//
// it("should not add to query string if the attribute in the query was used to build the URL", () => {
//   reactiveRecordTest.dispatch.reset();
// });
//
// it("should interpolate URL tokens that are not in the schema", () => {
//   reactiveRecordTest.dispatch.reset();
// });
// it("should give models access to the ReactiveRecord instance", ()=>{
//   reactiveRecordTest.model("Person", class extends Model {
//     static schema = {
//       name: String
//     }
//   });
