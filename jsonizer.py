#!/bin/python

import csv
import json
import io
import sys
import argparse
import random
from datetime import date, timedelta, datetime

TODAY = date.today()
DASHBOARD_DATE_FORMAT = "%a %b %d %Y %H:%M:%S"

i90_generators = {
    'caseId': lambda: str(random.randint(10000,99999)),
    'receiptNumber': lambda: "FKE%s" % random.randint(1000000,10000000),
    'creationDate': lambda: date(2014,8,1) + timedelta(random.randint(0,500)),
    'channelType': lambda: random.choice(["Pigeon", "Semaphore"]),
    'i90SP': lambda: random.choice(["true","false", "false"]), # bias toward false
    'caseState': lambda: random.choice(["Happy", "Despondent"]),
    'caseStatus': lambda: random.choice(['Eschewing Obfuscation', 'Ask a Silly Question get a Silly Answer', 'Pending', 'Processing']),
    'caseSubstatus': lambda: random.choice(['Amazingly Successful','Unfortunately Unclear','Printing','Scrutinizing']),
    'applicationReason': lambda: random.choice(['Boredom','Ennui','Enthusiasm']),
    'caseAge': lambda: "", # Fixed in post. Yes, this is a little dumb, but it's an adequate shim.
}

arg_opener = lambda(filename): io.open(filename, encoding='utf-8-sig')

parser = argparse.ArgumentParser()
parser.add_argument("-f", "--fake", action="store_true")
parser.add_argument("-n", "--rows-wanted", type=int, default=1000)
parser.add_argument("source_file", type=arg_opener, nargs="?")
parser.add_argument("--previous-file", type=arg_opener)
a = parser.parse_args()


extracted = []
ignore_receipts = set()

if (a.source_file):
    r = csv.DictReader(a.source_file)

if a.previous_file:
    for i in range(a.rows_wanted):
        ignore_receipts.add(r.next()['receiptNumber'])
    r = csv.DictReader(a.previous_file)

for i in range(a.rows_wanted):
    if a.fake:
        rec = {k: v() for (k, v) in i90_generators.items()}
        rec["caseAge"] = (TODAY - rec["creationDate"]).days
        rec["creationDate"] = rec["creationDate"].isoformat()
    else:
        rec = r.next()
        (unzoned_date, _) = rec["creationDate"].split(" GMT")
        creation_date = datetime.strptime(unzoned_date, DASHBOARD_DATE_FORMAT).date()
        rec["caseAge"] = (TODAY - creation_date).days
    if rec["receiptNumber"] not in ignore_receipts:
        extracted.append({k: rec[k] for k in i90_generators})

print json.dumps(extracted)