import React from "react";
import Dragula from "dragula";
import "dragula/dist/dragula.css";
import Swimlane from "./Swimlane";
import "./Board.css";
// import { data } from 'jquery';
import axios from "axios";

export default class Board extends React.Component {
  constructor() {
    super();
    this.state = {
      clientsraw: [],
      clients: {
        backlog: [],
        inProgress: [],
        complete: []
      }
    };
    this.swimlanes = {
      backlog: React.createRef(),
      inProgress: React.createRef(),
      complete: React.createRef()
    };
  }
  getClients() {
    axios
      .get("http://localhost:3001/api/v1/clients")
      .then(res => {
        let data = res.data;
        this.setState({
          clientsraw: data,
          clients: {
            backlog: data
              .filter(client => !client.status || client.status === "backlog")
              .sort((a, b) => (a.priority > b.priority ? 1 : -1)),
            inProgress: data
              .filter(
                client => client.status && client.status === "in-progress"
              )
              .sort((a, b) => (a.priority > b.priority ? 1 : -1)),
            complete: data
              .filter(client => client.status && client.status === "complete")
              .sort((a, b) => (a.priority > b.priority ? 1 : -1))
          }
        });
      })
      .catch(err => {
        console.log(err);
      });
  }
  updateClient(id, priority, status, siblingId, array) {
    var arrLength = array.length;
    // console.log(arrLength);
    var arr = [...array];
    if (siblingId !== -1) {
      // console.log("siblingId", "end", siblingId, arrLength);
      // console.log(array);
      var siblingIdArray = [];
      for (let i = siblingId; i < arrLength; i++) {
        siblingIdArray.push(arr[i].getAttribute("data-id"));
      }
    }
    axios
      .put(`http://localhost:3001/api/v1/clients/${id}`, {
        status,
        priority,
        siblingId,
        length: arrLength,
        siblingIdArray
      })
      .then(res => {
        console.log(res);
        // can add alerts
      })
      .catch(err => {
        console.log(err);
      });
  }
  renderSwimlane(name, clients, ref) {
    return <Swimlane name={name} clients={clients} dragulaRef={ref} />;
  }
  componentDidMount() {
    const backlog = this.swimlanes.backlog.current;
    const progress = this.swimlanes.inProgress.current;
    const complete = this.swimlanes.complete.current;
    const Board = this;
    this.getClients();
    Dragula([backlog, progress, complete], { revertOnSpill: true })
      .on("shadow", function(el, container) {
        // console.log(el, container);
        // console.log(el.dataId);
      })
      .on("drag", function(el) {
        // console.log('drag');
        // console.log(el);
      })
      .on("drop", function(el, target, source, sibling) {
        console.log("drop");
        // console.log('sibling', sibling);
        // var siblingId = sibling ? sibling.getAttribute('data-id') : null;
        // console.log('siblingIndex', siblingIndex);
        // let clientIndex = siblingIndex - 1;
        // console.log(clientIndex);
        switch (target) {
          case backlog:
            el.setAttribute("data-status", "backlog");
            el.setAttribute("class", "Card Card-grey");
            let backlogArray = Array.from(backlog.children);
            // console.log("BacklogChildren", backlogArray.length);
            let backlogElIndex = backlogArray.findIndex(backlogel => {
              return backlogel === el;
            });
            // console.log(sibling);
            let siblingIndex = backlogArray.findIndex(bkel => {
              return sibling === bkel;
            });
            let id = el.getAttribute("data-id");
            let status = el.getAttribute("data-status");
            // console.log("backlogEl", el);
            // console.log("backlogSiblingIndex", siblingIndex);
            // console.log("ID", el.getAttribute("data-id"));
            // console.log("Prority", backlogElIndex + 1);
            // console.log("Status", status);
            Board.updateClient(
              id,
              backlogElIndex + 1,
              status,
              siblingIndex,
              backlogArray
            );
            break;
          case progress:
            el.setAttribute("data-status", "in-progress");
            el.setAttribute("class", "Card Card-blue");
            let progressArray = Array.from(progress.children);
            // console.log("ProgressChildren", progressArray.length);
            let progressElIndex = progressArray.findIndex(progressEl => {
              return progressEl === el;
            });
            // console.log(sibling);
            let psiblingIndex = progressArray.findIndex(pel => {
              return sibling === pel;
            });
            let pid = el.getAttribute("data-id");
            // let psiblingId = sibling.getAttribute('data-id');
            let pstatus = el.getAttribute("data-status");
            // console.log("progressEl", el);
            // console.log("progressSiblingId", psiblingIndex);
            // console.log("ID", pid);
            // console.log("Prority", progressElIndex + 1);
            // console.log("Status", pstatus);
            Board.updateClient(
              pid,
              progressElIndex + 1,
              pstatus,
              psiblingIndex,
              progressArray
            );
            break;
          case complete:
            el.setAttribute("data-status", "complete");
            el.setAttribute("class", "Card Card-green");
            let completeArray = Array.from(complete.children);
            // console.log("CompleteChildren", completeArray.length);
            let completeElIndex = completeArray.findIndex(completeEl => {
              return completeEl === el;
            });
            let csiblingIndex = completeArray.findIndex(cel => {
              return sibling === cel;
            });
            let cid = el.getAttribute("data-id");
            // let csiblingId = sibling.getAttribute('data-id');
            let cstatus = el.getAttribute("data-status");
            // console.log("completeEl", el);
            // console.log("completeSiblingId", csiblingIndex);
            // console.log("ID", el.getAttribute("data-id"));
            // console.log("Priority", completeElIndex + 1);
            // console.log("Status", cstatus);
            Board.updateClient(
              cid,
              completeElIndex + 1,
              cstatus,
              csiblingIndex,
              completeArray
            );
            break;
          default:
            console.log("default");
        }
      });
  }

  render() {
    return (
      <div className="Board">
        <div className="container-fluid">
          <div className="row">
            <div className="col-md-4">
              {this.renderSwimlane(
                "Backlog",
                this.state.clients.backlog,
                this.swimlanes.backlog
              )}
            </div>
            <div className="col-md-4">
              {this.renderSwimlane(
                "In Progress",
                this.state.clients.inProgress,
                this.swimlanes.inProgress
              )}
            </div>
            <div className="col-md-4">
              {this.renderSwimlane(
                "Complete",
                this.state.clients.complete,
                this.swimlanes.complete
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
}
