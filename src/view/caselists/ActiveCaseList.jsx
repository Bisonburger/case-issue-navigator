import React, { useState, useEffect } from "react";
import { ActionModal } from "../util/ActionModal";
import SnoozeForm from "../../controller/SnoozeForm";
import ReceiptList from "../ReceiptList";
import UsaButton from "../util/UsaButton";

const ActiveCaseList = props => {
  const { loadCases } = props;
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    loadCases(currentPage);
  }, [loadCases, currentPage]);

  return (
    <React.Fragment>
      {props.showDialog && (
        <ActionModal
          isOpen={props.showDialog}
          title={props.dialogTitle}
          closeModal={props.callbacks.closeDialog}
        >
          <SnoozeForm callback={props.callbacks} rowData={props.clickedRow} />
        </ActionModal>
      )}
      <ReceiptList
        cases={props.cases}
        callback={props.callbacks}
        view="Cases to work"
        isLoading={props.isLoading}
      />
      {!props.isLoading && (
        <UsaButton onClick={() => setCurrentPage(currentPage + 1)}>
          Load More Cases
        </UsaButton>
      )}
    </React.Fragment>
  );
};

export { ActiveCaseList };
