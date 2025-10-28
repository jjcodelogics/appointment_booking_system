import React, { useEffect, useState } from 'react';
import api from '../../utils/api';

// Helper function to format the date
const formatAppointmentDate = isoString => {
  const date = new Date(isoString);
  const day = new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(date);
  const dayOfMonth = date.getDate();
  const month = new Intl.DateTimeFormat('en-US', { month: 'short' }).format(date);
  const hour = date.getHours().toString().padStart(2, '0');
  const minute = date.getMinutes().toString().padStart(2, '0');
  return `${day} ${month} ${dayOfMonth} at ${hour}:${minute}`;
};

const AdminDashboard = ({ user, onBookNew }) => {
  const [appointments, setAppointments] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    start_date: '',
    end_date: '',
    status: 'all',
    staff: '',
    search: '',
  });
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [selectedIds, setSelectedIds] = useState([]);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();

      if (filters.start_date) params.append('start_date', filters.start_date);
      if (filters.end_date) params.append('end_date', filters.end_date);
      if (filters.status && filters.status !== 'all') params.append('status', filters.status);
      if (filters.staff) params.append('staff', filters.staff);
      if (filters.search) params.append('search', filters.search);

      const response = await api.getAdminAppointments(params.toString());
      setAppointments(response.data);
      setError('');
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setError('Could not load appointments. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [filters]);

  const handleFilterChange = e => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSearchSubmit = e => {
    e.preventDefault();
    fetchAppointments();
  };

  const startEdit = appointment => {
    setEditingId(appointment.appointment_id);
    setEditData({
      appointment_date: new Date(appointment.appointment_date).toISOString().slice(0, 16),
      status: appointment.status || 'confirmed',
      staff_assigned: appointment.staff_assigned || '',
      notes: appointment.notes || '',
      customer_name: appointment.customer_name || '',
      customer_phone: appointment.customer_phone || '',
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditData({});
  };

  const saveEdit = async appointmentId => {
    try {
      await api.updateAdminAppointment(appointmentId, editData);
      setEditingId(null);
      setEditData({});
      fetchAppointments();
    } catch (err) {
      console.error('Error updating appointment:', err);
      setError(err.response?.data?.msg || 'Failed to update appointment.');
    }
  };

  const handleEditChange = (field, value) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  };

  const toggleSelectAppointment = id => {
    setSelectedIds(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === appointments.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(appointments.map(app => app.appointment_id));
    }
  };

  const handleBulkCancel = async () => {
    if (!window.confirm(`Cancel ${selectedIds.length} appointment(s)?`)) return;

    try {
      await api.bulkOperations({ appointment_ids: selectedIds, operation: 'cancel' });
      setSelectedIds([]);
      fetchAppointments();
    } catch (err) {
      console.error('Error in bulk cancel:', err);
      setError(err.response?.data?.msg || 'Failed to cancel appointments.');
    }
  };

  const handleExportCSV = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.start_date) params.append('start_date', filters.start_date);
      if (filters.end_date) params.append('end_date', filters.end_date);
      if (filters.status && filters.status !== 'all') params.append('status', filters.status);

      const response = await api.exportAppointments(params.toString());

      // Create a download link
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'appointments.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Error exporting CSV:', err);
      setError('Failed to export appointments.');
    }
  };

  const getStatusBadgeClass = status => {
    switch (status) {
      case 'confirmed':
        return 'badge-success';
      case 'pending':
        return 'badge-warning';
      case 'cancelled':
        return 'badge-danger';
      case 'completed':
        return 'badge-info';
      default:
        return 'badge-secondary';
    }
  };

  return (
    <main className="container admin-dashboard">
      <div className="dashboard-header">
        <h1>Admin Dashboard - Appointments</h1>
        <button onClick={onBookNew} className="btn btn-primary">
          Book New Appointment
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Filters */}
      <section className="filters-section">
        <h3>Filters</h3>
        <form onSubmit={handleSearchSubmit} className="filters-form">
          <div className="filter-group">
            <label>Start Date:</label>
            <input
              type="date"
              name="start_date"
              value={filters.start_date}
              onChange={handleFilterChange}
            />
          </div>
          <div className="filter-group">
            <label>End Date:</label>
            <input
              type="date"
              name="end_date"
              value={filters.end_date}
              onChange={handleFilterChange}
            />
          </div>
          <div className="filter-group">
            <label>Status:</label>
            <select name="status" value={filters.status} onChange={handleFilterChange}>
              <option value="all">All</option>
              <option value="confirmed">Confirmed</option>
              <option value="pending">Pending</option>
              <option value="cancelled">Cancelled</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Staff:</label>
            <input
              type="text"
              name="staff"
              placeholder="Staff name"
              value={filters.staff}
              onChange={handleFilterChange}
            />
          </div>
          <div className="filter-group">
            <label>Search:</label>
            <input
              type="text"
              name="search"
              placeholder="Customer name or phone"
              value={filters.search}
              onChange={handleFilterChange}
            />
          </div>
          <button type="submit" className="btn btn-secondary">
            Apply Filters
          </button>
        </form>
      </section>

      {/* Bulk Actions */}
      {selectedIds.length > 0 && (
        <section className="bulk-actions">
          <button onClick={handleBulkCancel} className="btn btn-danger">
            Cancel Selected ({selectedIds.length})
          </button>
          <button onClick={handleExportCSV} className="btn btn-info">
            Export CSV
          </button>
        </section>
      )}

      {/* Appointments Table */}
      <section className="appointments-table-section">
        <h2>Appointments (Current Week by Default)</h2>
        {loading ? (
          <p>Loading appointments...</p>
        ) : appointments.length > 0 ? (
          <div className="table-responsive">
            <table className="table admin-appointments-table">
              <thead>
                <tr>
                  <th>
                    <input
                      type="checkbox"
                      checked={
                        selectedIds.length === appointments.length && appointments.length > 0
                      }
                      onChange={toggleSelectAll}
                    />
                  </th>
                  <th>ID</th>
                  <th>Date/Time</th>
                  <th>Customer Name</th>
                  <th>Phone</th>
                  <th>Service</th>
                  <th>Status</th>
                  <th>Staff</th>
                  <th>Notes</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map(app => (
                  <tr key={app.appointment_id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(app.appointment_id)}
                        onChange={() => toggleSelectAppointment(app.appointment_id)}
                      />
                    </td>
                    <td>{app.appointment_id}</td>
                    <td>
                      {editingId === app.appointment_id ? (
                        <input
                          type="datetime-local"
                          value={editData.appointment_date}
                          onChange={e => handleEditChange('appointment_date', e.target.value)}
                        />
                      ) : (
                        formatAppointmentDate(app.appointment_date)
                      )}
                    </td>
                    <td>
                      {editingId === app.appointment_id ? (
                        <input
                          type="text"
                          value={editData.customer_name}
                          onChange={e => handleEditChange('customer_name', e.target.value)}
                        />
                      ) : (
                        app.customer_name || app.User?.name || '-'
                      )}
                    </td>
                    <td>
                      {editingId === app.appointment_id ? (
                        <input
                          type="text"
                          value={editData.customer_phone}
                          onChange={e => handleEditChange('customer_phone', e.target.value)}
                        />
                      ) : (
                        app.customer_phone || '-'
                      )}
                    </td>
                    <td>{app.Service?.service_name || '-'}</td>
                    <td>
                      {editingId === app.appointment_id ? (
                        <select
                          value={editData.status}
                          onChange={e => handleEditChange('status', e.target.value)}
                        >
                          <option value="confirmed">Confirmed</option>
                          <option value="pending">Pending</option>
                          <option value="cancelled">Cancelled</option>
                          <option value="completed">Completed</option>
                        </select>
                      ) : (
                        <span className={`badge ${getStatusBadgeClass(app.status)}`}>
                          {app.status || 'confirmed'}
                        </span>
                      )}
                    </td>
                    <td>
                      {editingId === app.appointment_id ? (
                        <input
                          type="text"
                          value={editData.staff_assigned}
                          onChange={e => handleEditChange('staff_assigned', e.target.value)}
                        />
                      ) : (
                        app.staff_assigned || '-'
                      )}
                    </td>
                    <td>
                      {editingId === app.appointment_id ? (
                        <textarea
                          value={editData.notes}
                          onChange={e => handleEditChange('notes', e.target.value)}
                          rows="2"
                        />
                      ) : (
                        app.notes || '-'
                      )}
                    </td>
                    <td className="actions-cell">
                      {editingId === app.appointment_id ? (
                        <>
                          <button
                            onClick={() => saveEdit(app.appointment_id)}
                            className="btn btn-success btn-sm"
                          >
                            Save
                          </button>
                          <button onClick={cancelEdit} className="btn btn-secondary btn-sm">
                            Cancel
                          </button>
                        </>
                      ) : (
                        <button onClick={() => startEdit(app)} className="btn btn-primary btn-sm">
                          Edit
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>No appointments found for the selected filters.</p>
        )}
      </section>
    </main>
  );
};

export default AdminDashboard;
