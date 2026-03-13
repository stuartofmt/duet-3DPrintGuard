# duetPrintGuard DWC Plugin

**This is a reconstructed version of the original authored by @oliverbravery**
https://gist.github.com/anonymous/dad852cde5df545ed81f1bc334ea6f72


duetPrintGuard offers local, **real-time print failure detection** for **3D printing** on edge devices. A **web interface** enables users to **monitor multiple printer-facing cameras**, and **receive failure notifications**

 When the **computer vision** fault detection model detects an issue it will  **automatically pause or cancel the print job**.


The detection engine and related functions (from the original) have not been changed. UI and control elements have been removed if they were not particularly relevent to the DWC plugin context. A minimal reimagined UI was created for ease of use in DWC and a simplified camera configuration created.

Additional configuration, accesable inside DWC, is provided by a configuration file that facilitaes:
-- IP and port setting
-- loggin
-- configurable printer actions when a failure occurs
-- several notofcation type ( Duet Macro, NTFY, Pusher)


**Instructions for installation and configuration are here:**
https://github.com/stuartofmt/duetPrintGuard/blob/main/docs/Getting-Started.md


> _The machine learning model's training code and technical research paper can be found [here](https://github.com/oliverbravery/Edge-FDM-Fault-Detection)._
