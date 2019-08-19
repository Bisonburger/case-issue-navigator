import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { CaseList } from "./CaseList";
import { VIEWS, I90_HEADERS } from "../../controller/config";
import { approximateDays } from "../util/approximateDays";
import caseFetcher from "../../model/caseFetcher";
import { getHeaders } from "../util/getHeaders";
import SnoozeForm from "../../controller/SnoozeForm";

const ActiveCaseList = props => {
  const [cases, setCases] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    setIsLoading(true);
    caseFetcher
      .getActiveCases(currentPage)
      .then(data => {
        setCases([...cases, ...data]);
        setIsLoading(false);
      })
      .catch(e => {
        console.error(e.message);
        setIsLoading(false);
        props.notify("There was an error loading cases.", "error");
      });
  }, [currentPage, setIsLoading]);

  const snooze = async (rowData, snoozeOption) => {
    try {
      const snoozeData = await caseFetcher.updateActiveSnooze(
        rowData.receiptNumber,
        {
          duration: snoozeOption.duration,
          reason: snoozeOption.value
        }
      );

      const snoozeDays = approximateDays({
        startDate: snoozeData.snoozeStart,
        endDate: snoozeData.snoozeEnd
      });

      props.updateSummaryData();
      props.notify(
        `${
          rowData.receiptNumber
        } has been Snoozed for ${snoozeDays} day${snoozeDays !== 1 &&
          "s"} due to ${snoozeData.snoozeReason}.`,
        "success"
      );

      setCases(cases.filter(c => c.receiptNumber !== rowData.receiptNumber));
    } catch (e) {
      console.error(e.message);
      props.notify(e.message, "error");
    }
  };

  const callbacks = {
    snooze
  };

  return (
    <CaseList
      cases={cases}
      callbacks={callbacks}
      view={VIEWS.CASES_TO_WORK.TITLE}
      headers={getHeaders(I90_HEADERS, VIEWS.CASES_TO_WORK.TITLE)}
      isLoading={isLoading}
      currentPage={currentPage}
      setCurrentPage={setCurrentPage}
      ModalContent={SnoozeForm}
    />
  );
};

ActiveCaseList.propTypes = {
  updateSummaryData: PropTypes.func,
  notify: PropTypes.func
};

export { ActiveCaseList };
