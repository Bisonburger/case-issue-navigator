import React, {Component} from 'react';
import 'uswds';
import './App.css';
import ReceiptList from './view/ReceiptList';
import PrimaryNavMenu from './view/PrimaryNavMenu';
import ModalDialog from './view/ModalDialog';
import * as case_api from "./model/FakeCaseFetcher";
import SnoozeForm from './controller/SnoozeForm';
import DeSnoozeForm from './controller/DeSnoozeForm';

import { library } from '@fortawesome/fontawesome-svg-core'
import { fas } from '@fortawesome/free-solid-svg-icons'

library.add(fas);

const ACTIVE_CASES_AT_START = 19171;

class App extends Component {
    constructor(props) {
      super(props);
      this.state = {
        active_cases: case_api.fetchAll(),
        resolved_cases: case_api.fetchResolved(),
        snoozed_cases : [],
        activeNavItem: null,
        showDialog: false,
        displayMode: "table"
      };
    }

    render(){
      const callbacks = {
        snooze: this.snooze.bind(this),
        details: this.detailView.bind(this),
        closeDialog: this.closeDialog.bind(this),
        snoozeUpdate: this.detailView.bind(this),
        deSnooze: this.deSnooze.bind(this),
        reSnooze: this.reSnooze.bind(this),
      };
      let cases = this.state.active_cases;
      if (this.state.activeNavItem === "Snoozed Cases") {
        cases = this.state.snoozed_cases;
      } else if (this.state.activeNavItem === "Resolved Cases") {
        cases = this.state.resolved_cases;
      }

      const case_count = {
        "Snoozed Cases": this.state.snoozed_cases.length,
        "Cases to work": (ACTIVE_CASES_AT_START - this.state.snoozed_cases.length),
        "Resolved Cases": 28, // that's the number right now, may as well be right
      };

      return (
        <div className="stuck-case-navigator">
          <div className="usa-overlay"></div>
          <PrimaryNavMenu
            title="Case Issue Navigator"
            items={["Cases to work", "Snoozed Cases", "Resolved Cases"]}
            active_item={this.state.activeNavItem}
            callback={{navSelect: this.setNav.bind(this)}}
            case_count={case_count}
            />
          <main id="main-content">
          <ModalDialog
            show={this.state.showDialog}
            modalTitle={this.state.dialogTitle}
            callback={callbacks}
            modalContent={this.state.activeNavItem !== "Snoozed Cases" 
               ? <SnoozeForm callback={callbacks} rowData={this.state.clickedRow} /> 
               : <DeSnoozeForm callback={callbacks} rowData={this.state.clickedRow} />
              }
          />
          <p className="text-italic">Data last refreshed: June 17th, 2019</p>
          <ReceiptList cases={cases} callback={callbacks} mode={this.state.displayMode} view={this.state.activeNavItem}/>
          </main>
        </div>
      );
    }

    setNav(event) {
      event.preventDefault();
      // ridiculous workaround for not using Router reaches its apex here:
      this.setState({activeNavItem: event.target.pathname.replace("/","").replace("%20", " ")})
    }

    reSnooze(rowData, snooze_option, snooze_text) {
      const new_snooze = this.state.snoozed_cases.filter(c => (c.receiptNumber !== rowData.receiptNumber));
      new_snooze.push(_snoozeRow(rowData, snooze_option, snooze_text));
      this.setState({snoozed_cases: new_snooze})
    }

    snooze(rowData, snooze_option, snooze_text) {
      const new_snoozed = [...this.state.snoozed_cases, _snoozeRow(rowData, snooze_option, snooze_text)]
      this.setState({
        active_cases: this.state.active_cases.filter(c => (c.receiptNumber !== rowData.receiptNumber)),
        snoozed_cases: new_snoozed.sort((a,b)=>(a.snooze_option.snooze_days - b.snooze_option.snooze_days))
      });
    }

    deSnooze(rowData) {
      let new_active = [...this.state.active_cases];
      new_active.unshift({...rowData, desnoozed: true});
      this.setState({
        snoozed_cases: this.state.snoozed_cases.filter(c => (c.receiptNumber !== rowData.receiptNumber)),
        active_cases: new_active,
      });
    }
    detailView(rowData) {
      this.setState({showDialog: true, dialogTitle: rowData.receiptNumber, clickedRow: rowData});
    }

    closeDialog() {
      this.setState({showDialog: false, clickedRow: null})
    }
}

function _snoozeRow(rowData, option, follow_up_text) {
  return {...rowData, snooze_option: option, snooze_followup: follow_up_text}
}

export default App;
