function AssessmentReview() {
  return (
    <div className="page-container">
      
      {/* Page Title */}
      <div className="page-header">
        <div className="header-section">CORE – ASSESSMENT WORKFLOW</div>
        <div className="header-title">
          Self Assessment & Manager Review
        </div>
      </div>

      {/* Stepper */}
      <div className="stepper">
        <div className="step active">✓ Self Assessment</div>
        <div className="step">Manager Review</div>
        <div className="step">Approved</div>
      </div>

      <div className="assessment-layout">
        
        {/* Left Panel */}
        <div className="assessment-sidebar">
          <div className="assessment-section active">
            Section A – Self Assessment
          </div>
          <div className="assessment-section">
            Section B – Manager Review
          </div>
          <div className="assessment-section">
            Section C – Approved Profile
          </div>
        </div>

        {/* Main Content */}
        <div className="assessment-content">
          <table className="skill-table">
            <thead>
              <tr>
                <th>Skill</th>
                <th>Required</th>
                <th>Self</th>
                <th>Manager</th>
                <th>Gap</th>
                <th>Evidence / Notes</th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td>Structural Design</td>
                <td>3</td>
                <td>2</td>
                <td>3</td>
                <td>-1</td>
                <td>Add evidence…</td>
              </tr>

              <tr>
                <td>Concrete Design</td>
                <td>3</td>
                <td>3</td>
                <td>3</td>
                <td>0</td>
                <td>Add evidence…</td>
              </tr>
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}

export default AssessmentReview;