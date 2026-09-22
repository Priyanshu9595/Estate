import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import axios from 'axios';
import PropertyDetails from './PropertyDetails';

vi.mock('axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    defaults: { headers: { common: {} } },
  },
}));

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({ user: { _id: 'u1', name: 'Test Tenant', role: 'User' } }),
}));

vi.mock('react-signature-canvas', () => ({ default: () => null }));
vi.mock('../utils/leaseGenerator', () => ({ generateLeasePDF: vi.fn() }));

const buildProperty = (overrides = {}) => ({
  _id: 'p1',
  name: 'Maple Residency',
  type: 'Apartment',
  address: '12 Maple Street',
  city: 'Pune',
  state: 'Maharashtra',
  rent_amount: 15000,
  deposit_amount: 30000,
  images: [],
  ...overrides,
});

const buildUnit = (overrides = {}) => ({
  _id: 'u-101',
  unit_no: '101',
  status: 'Available',
  rent_amount: 15000,
  ...overrides,
});

const renderAt = (id = 'p1') =>
  render(
    <MemoryRouter initialEntries={[`/property/${id}`]}>
      <Routes>
        <Route path="/property/:id" element={<PropertyDetails />} />
      </Routes>
    </MemoryRouter>
  );

/** Route each endpoint the page calls to a caller-supplied response. */
const mockEndpoints = ({ properties = {}, reviews = {}, lease = { data: {} } }) => {
  axios.get.mockImplementation((url) => {
    if (url.startsWith('/api/properties/')) {
      const id = url.split('/').pop();
      return properties[id] ?? Promise.reject(new Error(`no mock for property ${id}`));
    }
    if (url.startsWith('/api/reviews/')) {
      const id = url.split('/').pop();
      return reviews[id] ?? Promise.resolve({ data: { reviews: [], averageRating: 0 } });
    }
    if (url === '/api/leases/my-lease') return Promise.resolve(lease);
    return Promise.reject(new Error(`unexpected request: ${url}`));
  });
};

describe('PropertyDetails', () => {
  beforeEach(() => {
    axios.get.mockReset();
  });

  it('renders the property and its rooms once loaded', async () => {
    mockEndpoints({
      properties: {
        p1: Promise.resolve({ data: { property: buildProperty(), units: [buildUnit(), buildUnit({ _id: 'u-102', unit_no: '102' })] } }),
      },
    });

    renderAt('p1');

    expect(screen.getByText(/loading property details/i)).toBeInTheDocument();

    expect(await screen.findByRole('heading', { name: 'Maple Residency' })).toBeInTheDocument();
    expect(screen.getByText(/12 Maple Street, Pune, Maharashtra/)).toBeInTheDocument();
    expect(screen.getByText('101')).toBeInTheDocument();
    expect(screen.getByText('102')).toBeInTheDocument();
  });

  it('shows the average rating once reviews arrive', async () => {
    mockEndpoints({
      properties: { p1: Promise.resolve({ data: { property: buildProperty(), units: [buildUnit()] } }) },
      reviews: {
        p1: Promise.resolve({
          data: { reviews: [{ _id: 'r1', rating: 4, comment: 'Great place' }], averageRating: 4.5 },
        }),
      },
    });

    renderAt('p1');

    expect(await screen.findByText('4.5')).toBeInTheDocument();
    expect(screen.getByText('(1 reviews)')).toBeInTheDocument();
  });

  it('filters rooms by the search box', async () => {
    const user = userEvent.setup();
    mockEndpoints({
      properties: {
        p1: Promise.resolve({ data: { property: buildProperty(), units: [buildUnit(), buildUnit({ _id: 'u-102', unit_no: '102' })] } }),
      },
    });

    renderAt('p1');
    await screen.findByText('101');

    await user.type(screen.getByPlaceholderText(/search room number/i), '102');

    expect(screen.getByText('102')).toBeInTheDocument();
    expect(screen.queryByText('101')).not.toBeInTheDocument();
  });

  it('tells the user when a property has no rooms yet', async () => {
    mockEndpoints({
      properties: { p1: Promise.resolve({ data: { property: buildProperty(), units: [] } }) },
    });

    renderAt('p1');

    expect(await screen.findByText(/no rooms are available for this property yet/i)).toBeInTheDocument();
  });

  it('surfaces a server error instead of the property', async () => {
    mockEndpoints({
      properties: {
        p1: Promise.reject({ response: { data: { message: 'Property not found' } } }),
      },
    });

    renderAt('p1');

    expect(await screen.findByText('Property not found')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Maple Residency' })).not.toBeInTheDocument();
  });

  it('does not leave the previous property on screen when the id changes', async () => {
    let resolveFirst;
    const firstProperty = new Promise((resolve) => {
      resolveFirst = resolve;
    });

    mockEndpoints({
      properties: {
        p1: firstProperty,
        p2: Promise.resolve({ data: { property: buildProperty({ _id: 'p2', name: 'Birch Towers' }), units: [buildUnit({ _id: 'u-201', unit_no: '201' })] } }),
      },
    });

    const { unmount } = renderAt('p1');
    resolveFirst({ data: { property: buildProperty(), units: [buildUnit()] } });
    await screen.findByRole('heading', { name: 'Maple Residency' });
    unmount();

    renderAt('p2');
    expect(await screen.findByRole('heading', { name: 'Birch Towers' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Maple Residency' })).not.toBeInTheDocument();
  });
});

describe('PropertyDetails booking availability', () => {
  beforeEach(() => {
    axios.get.mockReset();
  });

  const withLease = (lease) => {
    axios.get.mockImplementation((url) => {
      if (url === '/api/properties/p1') {
        return Promise.resolve({ data: { property: buildProperty(), units: [buildUnit()] } });
      }
      if (url.startsWith('/api/reviews/')) return Promise.resolve({ data: { reviews: [], averageRating: 0 } });
      if (url === '/api/leases/my-lease') return lease();
      return Promise.reject(new Error(`unexpected request: ${url}`));
    });
  };

  it('offers booking to a tenant who holds no lease', async () => {
    withLease(() => Promise.resolve({ data: {} }));

    renderAt('p1');

    expect(await screen.findByRole('button', { name: 'Book Now' })).toBeInTheDocument();
  });

  it('withholds booking from a tenant who already holds a lease', async () => {
    withLease(() => Promise.resolve({ data: { _id: 'lease-1' } }));

    renderAt('p1');
    await screen.findByText('101');

    expect(screen.queryByRole('button', { name: 'Book Now' })).not.toBeInTheDocument();
  });
});
