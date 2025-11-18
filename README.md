# Qivook - East Africa Trade Intelligence Platform

## Overview

Qivook is a comprehensive trade intelligence platform designed specifically for East Africa's construction and agriculture sectors. It provides real-time market insights, supplier networks, logistics optimization, risk management, and financing solutions - all in one powerful, user-friendly platform.

## What is Qivook?

Qivook is a B2B trade intelligence platform that helps businesses in East Africa:

- **Track Prices**: Monitor real-time material and input prices across different regions
- **Find Suppliers**: Access a verified network of suppliers with ratings and reviews
- **Optimize Logistics**: Plan routes, calculate costs, and manage shipments
- **Manage Risk**: Identify and mitigate supply chain risks with insurance solutions
- **Access Financing**: Connect with trade financing options
- **Navigate Documentation**: Understand and manage trade documentation requirements

## Key Features

### 1. Market Intelligence

#### Price Tracking
- Real-time price monitoring for construction materials and agricultural inputs
- Historical price trends and analytics
- Price alerts and notifications
- Multi-region price comparisons
- Market volatility tracking

#### Country Profiles
- Comprehensive country-specific market data
- Demand mapping and analysis
- Infrastructure overviews
- Trade regulations and requirements
- Economic indicators

#### Analytics Dashboard
- Industry-specific insights
- Market trend analysis
- Predictive analytics
- Customizable reports
- Data visualization tools

### 2. Supply Chain Management

#### Supplier Directory
- Verified supplier network
- Supplier ratings and reviews
- Performance metrics
- Contact information
- Material availability

#### Agents Network
- Find and connect with trade agents
- Agent ratings and specialties
- Communication tools
- Commission tracking

#### Logistics Planning
- Route planning and optimization
- Cost calculators
- Shipment tracking
- Delivery time estimates
- Multi-modal transport options

### 3. Risk Management

#### Risk Assessment
- Supply chain risk identification
- Country and supplier risk scoring
- Alert system for high-risk situations
- Risk timeline tracking

#### Insurance Solutions
- Coverage gap analysis
- Insurance provider connections
- Policy recommendations
- Claims management

#### Risk Playbooks
- Pre-defined risk mitigation strategies
- Industry-specific best practices
- Emergency response procedures

### 4. Financial Services

#### Trade Financing
- Financing options discovery
- Application management
- Interest rate comparisons
- Payment terms negotiation

### 5. Documentation

#### Document Vault
- Comprehensive trade document library
- Country-specific requirements
- Document checklists
- Processing times and costs
- Step-by-step guides

## Industry Support

Qivook supports two main industries:

### Construction
- Building materials tracking (cement, steel, timber, sand, aggregates, bricks)
- Project management integration
- Material cost tracking
- Supplier performance analysis
- Safety & compliance alerts
- Equipment rental tracking

### Agriculture
- Farming inputs tracking (fertilizer, seeds, pesticides, equipment, irrigation, feed)
- Seasonal planning & calendar
- Crop-specific input tracking
- Weather integration
- Harvest planning
- Farm equipment management

## Technology Stack

### Frontend
- **React** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Lucide React** for icons

### Backend & Services
- **Supabase** for authentication and database
- **PostgreSQL** database
- **Real-time subscriptions** for live updates

### Mobile
- **React Native** for mobile app
- Cross-platform support (iOS & Android)

### Deployment
- **Vercel** for web app hosting
- **GitHub** for version control

## Getting Started

### Prerequisites
- Node.js 18+ and npm/yarn
- Git
- Supabase account (for backend services)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/kuccii/Qboltv2.git
   cd Qboltv2
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173`

### Mobile App Setup

1. **Navigate to mobile app directory**
   ```bash
   cd mobile-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run on iOS**
   ```bash
   npm run ios
   ```

4. **Run on Android**
   ```bash
   npm run android
   ```

## Project Structure

```
Qboltv2/
├── src/                    # Web app source code
│   ├── components/         # React components
│   ├── pages/             # Page components
│   ├── contexts/          # React contexts (Auth, Theme, Industry)
│   ├── services/          # API services
│   ├── lib/               # Utility libraries
│   └── config/            # Configuration files
├── mobile-app/            # React Native mobile app
├── database/              # Database schemas and migrations
└── public/                # Static assets
```

## Key Components

### Authentication
- Email/password authentication via Supabase
- Session management
- User profile management
- Industry selection

### Navigation
- Desktop: Horizontal navigation with dropdowns
- Mobile: Bottom tab navigation + slide-out menu
- Responsive design across all screen sizes

### Industry Context
- Industry switching (Construction/Agriculture)
- Industry-specific data and features
- Persistent industry selection

### Theme Support
- Light and dark mode
- System preference detection
- Persistent theme selection

## User Flow

1. **Registration/Login**: Users create an account or log in
2. **Industry Selection**: Choose between Construction or Agriculture
3. **Dashboard**: Access industry-specific dashboard with key metrics
4. **Navigation**: Explore features via navigation menu
5. **Data Interaction**: View prices, suppliers, logistics, risks, etc.
6. **Actions**: Take actions like contacting suppliers, planning routes, etc.

## Responsive Design

The platform is fully responsive:
- **Desktop**: Full navigation with dropdowns, sidebars, and detailed views
- **Tablet**: Optimized layouts with collapsible sections
- **Mobile**: Bottom tab navigation, slide-out menu, touch-optimized controls

## Features by Page

### Dashboard
- Industry-specific overview
- Key metrics and KPIs
- Recent activity
- Quick actions
- Tabbed interface (Overview, Insights, Alerts)

### Price Tracking
- Material price lists
- Price charts and trends
- Filter by material, region, date
- Export functionality

### Supplier Directory
- Supplier listings with filters
- Supplier profiles
- Ratings and reviews
- Contact information
- Performance metrics

### Logistics
- Route planner
- Cost calculator
- Saved routes
- Shipment tracking
- Overview dashboard

### Risk Mitigation
- Risk overview
- Alert management
- Timeline view
- Insurance coverage
- Risk playbooks

### Documents
- Document library
- Country-specific requirements
- Personal checklist
- Resources and guides

## API Integration

The platform integrates with:
- **Supabase**: Authentication, database, real-time subscriptions
- **External APIs**: Price data, logistics data (as needed)

## Security

- Secure authentication via Supabase
- Row-level security (RLS) policies
- Encrypted data transmission
- User role-based access control
- Session management

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is proprietary software. All rights reserved.

## Support

For support, email support@qivook.com or open an issue in the repository.

## Roadmap

- [ ] Enhanced analytics and reporting
- [ ] Mobile app improvements
- [ ] Additional country support
- [ ] Advanced logistics features
- [ ] Integration with more payment providers
- [ ] AI-powered price predictions
- [ ] Enhanced supplier verification
- [ ] Multi-language support

## Acknowledgments

Built with ❤️ for East African businesses.
