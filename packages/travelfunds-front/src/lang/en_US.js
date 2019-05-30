export default {
  formSteps: {
    contact: 'Contact Information',
    travelDetails: 'Travel Details',
    traveler: 'Traveler Information',
    travelCosts: 'Travel Costs'
  },

  loginPage: [
    'Welcome to the Faculty Travel Funding Request Form! Faculty travel funding is available for members of the AAUP bargaining unit at Storrs, Law School, and regional campuses only. UConn Health faculty are not eligible. Please see eligibility section of the <a target="_blank" rel="noopener noreferrer" href="http://research.uconn.edu/funding/faculty-travel/">guidelines</a>.',
    `Receiving an AAUP/OVPR Travel Award <strong>does not infer that such travel has been approved by the University</strong>, only that the awardee has travel funding available to reimburse expenses from approved travel. Before traveling or making travel arrangements:
    <ul>
      <li>All Faculty must obtain approval from their department or unit head, per the AAUP contract.</li>
      <li>Faculty traveling internationally must obtain approval from Global Affairs.</li>
      <li>Faculty traveling to embargoed regions (currently Cuba, Iran, Syria, North Korea, and Crimea) must seek approval from OVPR Export Control.</li>
    </ul>`,
    'Login with your NetID to begin.'
  ],

  loginPageWarnings: [
    'All Faculty must obtain approval from their department or unit head, per the AAUP contract.',
    'Faculty traveling internationally must obtain approval from Global Affairs.',
    'Faculty traveling to embargoed regions (currently Cuba, Iran, Syria, North Korea, and Crimea) must seek approval from OVPR Export Control.'
  ],

  welcome: [
    'Welcome to the Faculty Travel Request Form. Applications will be processed on a first-come, first served basis.',
    'To begin, please enter an email for the administrative contact in your department who is responsible for processing travel reimbursements. Admin contacts named here will be copied on award letters, allowing your department to process reimbursements more easily.'
  ],

  finished: 'Thanks for submitting a request for travel funding. A confirmation email will be sent to both the contact and the traveling faculty now. A followup email will be sent with the funding status once the request has been reviewed.',

  tooltips: {
    'default': [
      'This sidebar will show more information about the field you\'re editing.',
      'If you still have any questions that are not answered by the guidelines, please contact Phyllis Horvith at <a href="mailto:phyllis.horvith@uconn.edu">phyllis.horvith@uconn.edu</a>'
    ],
    'contact.email': 'Admin contacts named here will be copied on award letters, allowing your department to process reimbursements more easily.',
    'traveler.yearOfTerminalDegree': 'Following the most recent AAUP contract, the year of terminal degree is used to establish whether the traveler qualifies as "junior" or early career faculty for the purposes of this program. Junior faculty are defined as those within 7 years of their terminal degree. See guidelines for more detail',
    'travelDetails.startDate': [
      'When will you be leaving?',
      'All requests for Travel Funding must be submitted PRIOR to travel. No awards will be made for travel that has already occurred. For more information, read the guidelines.',
      'NOTE: The online request form for travel in the next fiscal year will be available mid May of the preceding year.'
    ],
    'travelDetails.participationLevel': [
      'Examples of active participation: In conjunction with a conference, presentation of a research paper or poster session, chairmanship of a research session, discussant on a symposium panel, participant in a gallery opening, solo, choral, orchestral, musical, and dance performances.',
      'Travel may be domestic or international.'
    ],
    'travelDetails.primaryMethodOfTravel': 'Car rental and parking are not eligible expenses.',
    'travelCosts.primaryTransport': 'Car rental and parking are not eligible expenses.',
    'travelCosts.secondaryTransport': 'Shuttle/Secondary Transport costs are covered for one (1) round-trip from the airport/station/terminal to the conference site. Approved methods of secondary transport: taxi, bus, train, airport/hotel shuttle. Requests exceeding $50 for domestic travel and $100 for foreign travel need justification and documentation. For more information, please review the guidelines.',
    'travelCosts.mileage': 'For use when travelling via car.(<a target="_blank" rel="noopener noreferrer" href="http://travel.uconn.edu/mileage-calculation/">Current Rates</a>)',
    'travelCosts.registration': 'Registration Cost may not include any membership dues or fees. Only cost of registering for the event will be considered.',
    'travelCosts.mealsAndLodging': 'Meals & Lodging should be submitted in FULL.The online travel request will calculate the qualifying amounts for you. To learn more about the criteria used to determine the qualified amounts, please review the guidelines.'
  }
}
