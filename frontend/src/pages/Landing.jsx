import { Link } from 'react-router-dom'
import './Landing.css'

const Landing = () => {
  return (
    <div className="fs-landing">
      {/* Top Nav */}
      <nav className="fs-nav">
        <div className="fs-nav-inner">
          <div className="fs-logo">
            <span className="fs-logo-icon">₿</span>
            <span className="fs-logo-text">Fin<span>Split</span></span>
          </div>
          <div className="fs-nav-right">
            <Link to="/login" className="fs-nav-link">Sign In</Link>
            <Link to="/register" className="fs-nav-cta">Start Free →</Link>
          </div>
        </div>
      </nav>

      {/* Hero — Split Layout */}
      <section className="fs-hero">
        <div className="fs-hero-left">
          <div className="fs-tag">🚀 Personal Finance + Splitwise</div>
          <h1 className="fs-h1">
            Your money,<br />
            <em>simplified.</em>
          </h1>
          <p className="fs-hero-desc">
            Track every rupee, dollar or euro. Split bills with friends.
            See where your money goes — with beautiful charts that actually make sense.
          </p>
          <div className="fs-hero-actions">
            <Link to="/register" className="fs-btn-main">Get Started — It&apos;s Free</Link>
            <Link to="/login" className="fs-btn-ghost">I have an account</Link>
          </div>
          <div className="fs-trust">
            <div className="fs-trust-item">✓ No credit card</div>
            <div className="fs-trust-item">✓ Works on any device</div>
            <div className="fs-trust-item">✓ JWT secured</div>
          </div>
        </div>

        <div className="fs-hero-right">
          {/* Floating cards */}
          <div className="fs-card-stack">
            <div className="fs-float-card balance-card">
              <div className="fc-label">Net Balance</div>
              <div className="fc-value positive">+$2,400</div>
              <div className="fc-bar"><div className="fc-bar-fill" style={{width:'65%'}}></div></div>
              <div className="fc-sub">65% saved this month</div>
            </div>

            <div className="fs-float-card tx-card">
              <div className="fc-label">Recent</div>
              <div className="tx-row"><span>🍕 Zomato</span><span className="tx-neg">-$12</span></div>
              <div className="tx-row"><span>💼 Salary</span><span className="tx-pos">+$3,200</span></div>
              <div className="tx-row"><span>🏠 Rent</span><span className="tx-neg">-$800</span></div>
            </div>

            <div className="fs-float-card split-card">
              <div className="fc-label">👥 Goa Trip</div>
              <div className="split-row">
                <div className="split-avatar">R</div>
                <div className="split-name">Rahul</div>
                <div className="split-owes">owes you <strong>$45</strong></div>
              </div>
              <div className="split-row">
                <div className="split-avatar">P</div>
                <div className="split-name">Priya</div>
                <div className="split-owes">owes you <strong>$30</strong></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <div className="fs-stats-bar">
        <div className="fs-stat"><span className="fs-stat-n">7</span><span>Entities tracked</span></div>
        <div className="fs-stat-div"></div>
        <div className="fs-stat"><span className="fs-stat-n">10+</span><span>Categories</span></div>
        <div className="fs-stat-div"></div>
        <div className="fs-stat"><span className="fs-stat-n">∞</span><span>Groups & splits</span></div>
        <div className="fs-stat-div"></div>
        <div className="fs-stat"><span className="fs-stat-n">100%</span><span>Free to use</span></div>
      </div>

      {/* Features — Alternating layout */}
      <section className="fs-features">
        <div className="fs-feat-row">
          <div className="fs-feat-text">
            <div className="fs-feat-tag">TRACK</div>
            <h2>Know where every<br />dollar goes</h2>
            <p>Add transactions in seconds. Pick from 15 categories — Food, Rent, Salary, Travel, Health and more. Filter by type, date, or category.</p>
            <Link to="/register" className="fs-feat-link">Start tracking →</Link>
          </div>
          <div className="fs-feat-visual v1">
            <div className="fv-header">💸 Transactions</div>
            <div className="fv-row income"><span>💼 Salary</span><span>+$3,200</span></div>
            <div className="fv-row expense"><span>🍔 Food</span><span>-$340</span></div>
            <div className="fv-row expense"><span>🚗 Transport</span><span>-$120</span></div>
            <div className="fv-row income"><span>💻 Freelance</span><span>+$800</span></div>
            <div className="fv-summary">Balance: <strong>+$3,540</strong></div>
          </div>
        </div>

        <div className="fs-feat-row reverse">
          <div className="fs-feat-text">
            <div className="fs-feat-tag">VISUALIZE</div>
            <h2>Charts that tell<br />your money story</h2>
            <p>Monthly bar charts compare income vs expenses. Doughnut charts break down where you spend. All powered by Chart.js with live data from your Spring Boot backend.</p>
            <Link to="/register" className="fs-feat-link">See your charts →</Link>
          </div>
          <div className="fs-feat-visual v2">
            <div className="fv-header">📊 This Year</div>
            <div className="mini-bars">
              {[{m:'J',i:60,e:35},{m:'F',i:70,e:45},{m:'M',i:50,e:30},{m:'A',i:80,e:55},{m:'M',i:65,e:40},{m:'J',i:90,e:50}].map(d => (
                <div key={d.m} className="mini-bar-col">
                  <div className="mini-bar i" style={{height:`${d.i}%`}}></div>
                  <div className="mini-bar e" style={{height:`${d.e}%`}}></div>
                  <span>{d.m}</span>
                </div>
              ))}
            </div>
            <div className="mini-legend">
              <span><em style={{background:'#10b981'}}></em>Income</span>
              <span><em style={{background:'#ef4444'}}></em>Expense</span>
            </div>
          </div>
        </div>

        <div className="fs-feat-row">
          <div className="fs-feat-text">
            <div className="fs-feat-tag">SPLIT</div>
            <h2>Split bills like<br />Splitwise, but yours</h2>
            <p>Create groups for trips, home, or work. Add expenses, split equally. The smart settlement engine minimizes transactions — tells you exactly who pays whom.</p>
            <Link to="/register" className="fs-feat-link">Create a group →</Link>
          </div>
          <div className="fs-feat-visual v3">
            <div className="fv-header">✈️ Goa Trip · $450 total</div>
            <div className="settle-row">
              <div className="s-avatar">R</div>
              <div className="s-info"><strong>Rahul</strong> owes <strong>Arjun</strong></div>
              <div className="s-amount">$75</div>
            </div>
            <div className="settle-row">
              <div className="s-avatar">P</div>
              <div className="s-info"><strong>Priya</strong> owes <strong>Arjun</strong></div>
              <div className="s-amount">$50</div>
            </div>
            <div className="settle-tag">💡 2 transactions to settle all</div>
          </div>
        </div>
      </section>

      {/* Tech */}
      <section className="fs-tech">
        <h3>Built with</h3>
        <div className="fs-tech-pills">
          {['Java 17','Spring Boot 3','Spring Security','JWT Auth','Hibernate / JPA','MySQL','React 18','Chart.js','Axios REST'].map(t => (
            <span key={t} className="fs-pill">{t}</span>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="fs-cta-section">
        <div className="fs-cta-box">
          <h2>Ready to take control?</h2>
          <p>Free forever. No card required. Start in 30 seconds.</p>
          <Link to="/register" className="fs-btn-main large">Create Free Account →</Link>
        </div>
      </section>

      <footer className="fs-footer">
        <span>₿ FinSplit · Java Spring Boot + React + MySQL · Built for portfolio</span>
      </footer>
    </div>
  )
}

export default Landing
