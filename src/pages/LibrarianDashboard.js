import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { studentAPI, bookAPI, issueAPI } from '../api';

export const LibrarianDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [students, setStudents] = useState([]);
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeIssues, setActiveIssues] = useState([]);
  const [overdueIssues, setOverdueIssues] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form states
  const [newStudent, setNewStudent] = useState({ name: '', email: '', enrollment_number: '', phone: '', department: '', semester: '' });
  const [newBook, setNewBook] = useState({ title: '', author: '', isbn: '', category_id: '', publisher: '', total_quantity: 1 });
  const [newCategory, setNewCategory] = useState({ category_name: '', description: '' });
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [selectedBookId, setSelectedBookId] = useState('');
  const [dueDate, setDueDate] = useState('');

  useEffect(() => {
    loadDashboardData();
    loadCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      if (activeTab === 'students') {
        const response = await studentAPI.getStudents();
        setStudents(response.data);
      } else if (activeTab === 'books') {
        const response = await bookAPI.getBooks({});
        setBooks(response.data);
      } else if (activeTab === 'issues') {
        const [active, overdue, studentsRes, booksRes] = await Promise.all([
          issueAPI.getActiveIssues(),
          issueAPI.getOverdueIssues(),
          studentAPI.getStudents(),
          bookAPI.getBooks({}),
        ]);
        setActiveIssues(active.data);
        setOverdueIssues(overdue.data);
        setStudents(studentsRes.data);
        setBooks(booksRes.data);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await bookAPI.getCategories();
      setCategories(response.data);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await studentAPI.addStudent(newStudent);
      setNewStudent({ name: '', email: '', enrollment_number: '', phone: '', department: '', semester: '' });
      await loadDashboardData();
      alert('✓ Student added successfully!');
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to add student');
    } finally {
      setLoading(false);
    }
  };

  const handleAddBook = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await bookAPI.addBook(newBook);
      setNewBook({ title: '', author: '', isbn: '', category_id: '', publisher: '', total_quantity: 1 });
      await loadDashboardData();
      alert('✓ Book added successfully!');
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to add book');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await bookAPI.addCategory(newCategory);
      setNewCategory({ category_name: '', description: '' });
      await loadCategories();
      alert('✓ Category added successfully!');
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to add category');
    } finally {
      setLoading(false);
    }
  };

  const handleIssueBook = async (e) => {
    e.preventDefault();
    if (!selectedStudentId || !selectedBookId || !dueDate) {
      alert('Please fill all fields');
      return;
    }
    try {
      setLoading(true);
      await issueAPI.issueBook({
        student_id: parseInt(selectedStudentId),
        book_id: parseInt(selectedBookId),
        due_date: dueDate,
      });
      setSelectedStudentId('');
      setSelectedBookId('');
      setDueDate('');
      await loadDashboardData();
      alert('✓ Book issued successfully!');
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to issue book');
    } finally {
      setLoading(false);
    }
  };

  const handleReturnBook = async (issueId) => {
    try {
      setLoading(true);
      await issueAPI.returnBook({ issue_id: issueId });
      await loadDashboardData();
      alert('✓ Book returned successfully!');
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to return book');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleChangePassword = () => {
    navigate('/change-password');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-blue-600 text-white p-4 mb-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Librarian Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm">Welcome, {user?.name}</span>
            <button
              onClick={handleChangePassword}
              className="bg-blue-500 hover:bg-blue-700 px-3 py-2 rounded text-sm"
            >
              Change Password
            </button>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-700 px-3 py-2 rounded text-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-6 mb-6">
        <div className="flex gap-2 border-b">
          {['dashboard', 'students', 'books', 'issues'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 font-semibold capitalize border-b-2 transition ${
                activeTab === tab
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6">
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div>
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block">
                  <div className="animate-spin text-4xl">⏳</div>
                  <p className="mt-4 text-gray-600 font-semibold">Loading dashboard...</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 rounded-lg shadow p-6 border-l-4 border-blue-600">
                  <h3 className="text-gray-600 text-sm font-semibold">Total Students</h3>
                  <p className="text-3xl font-bold text-blue-600 mt-2">{students.length}</p>
                </div>
                <div className="bg-green-50 rounded-lg shadow p-6 border-l-4 border-green-600">
                  <h3 className="text-gray-600 text-sm font-semibold">Total Books</h3>
                  <p className="text-3xl font-bold text-green-600 mt-2">{books.length}</p>
                </div>
                <div className="bg-purple-50 rounded-lg shadow p-6 border-l-4 border-purple-600">
                  <h3 className="text-gray-600 text-sm font-semibold">Active Issues</h3>
                  <p className="text-3xl font-bold text-purple-600 mt-2">{activeIssues.length}</p>
                </div>
                <div className="bg-red-50 rounded-lg shadow p-6 border-l-4 border-red-600">
                  <h3 className="text-gray-600 text-sm font-semibold">Overdue</h3>
                  <p className="text-3xl font-bold text-red-600 mt-2">{overdueIssues.length}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Students Tab */}
        {activeTab === 'students' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold mb-4">👤 Add New Student</h2>
                <form onSubmit={handleAddStudent} className="space-y-3">
                  <input
                    type="text"
                    placeholder="Name"
                    value={newStudent.name}
                    onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                    required
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={newStudent.email}
                    onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Enrollment Number"
                    value={newStudent.enrollment_number}
                    onChange={(e) => setNewStudent({ ...newStudent, enrollment_number: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                    required
                  />
                  <input
                    type="tel"
                    placeholder="Phone"
                    value={newStudent.phone}
                    onChange={(e) => setNewStudent({ ...newStudent, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="Department"
                    value={newStudent.department}
                    onChange={(e) => setNewStudent({ ...newStudent, department: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                  />
                  <input
                    type="number"
                    placeholder="Semester"
                    value={newStudent.semester}
                    onChange={(e) => setNewStudent({ ...newStudent, semester: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                  />
                  <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 font-semibold"
                  >
                    {loading ? '⏳ Adding Student...' : 'Add Student'}
                  </button>
                </form>
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-6 border-b">
                  <h2 className="text-xl font-bold">📚 Students List</h2>
                </div>
                <div className="overflow-x-auto">
                  {loading ? (
                    <div className="p-6 text-center">
                      <div className="inline-block">
                        <div className="animate-spin">⏳</div>
                        <p className="mt-2 text-gray-600">Loading students...</p>
                      </div>
                    </div>
                  ) : students.length === 0 ? (
                    <div className="p-6 text-center text-gray-500">No students added yet</div>
                  ) : (
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="px-6 py-3 text-left text-sm font-semibold">Name</th>
                          <th className="px-6 py-3 text-left text-sm font-semibold">Email</th>
                          <th className="px-6 py-3 text-left text-sm font-semibold">Enrollment</th>
                          <th className="px-6 py-3 text-left text-sm font-semibold">Phone</th>
                        </tr>
                      </thead>
                      <tbody>
                        {students.map((student) => (
                          <tr key={student.student_id} className="border-b hover:bg-gray-50">
                            <td className="px-6 py-4 text-sm">{student.name}</td>
                            <td className="px-6 py-4 text-sm">{student.email}</td>
                            <td className="px-6 py-4 text-sm">{student.enrollment_number}</td>
                            <td className="px-6 py-4 text-sm">{student.phone || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Books Tab */}
        {activeTab === 'books' && (
          <div className="space-y-6">
            {/* Add Category Section */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4">📚 Add New Category</h2>
              <form onSubmit={handleAddCategory} className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                <input
                  type="text"
                  placeholder="Category Name"
                  value={newCategory.category_name}
                  onChange={(e) => setNewCategory({ ...newCategory, category_name: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                  required
                />
                <input
                  type="text"
                  placeholder="Description (optional)"
                  value={newCategory.description}
                  onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                />
                <button
                  type="submit"
                  className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 font-semibold"
                >
                  {loading ? 'Adding...' : 'Add Category'}
                </button>
              </form>
              {categories.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <span key={cat.category_id} className="bg-blue-100 text-blue-800 px-3 py-1 rounded text-sm font-semibold">
                      {cat.category_name}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Add Book & Books List */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-bold mb-4">➕ Add New Book</h2>
                  <form onSubmit={handleAddBook} className="space-y-3">
                    <input
                      type="text"
                      placeholder="Title"
                      value={newBook.title}
                      onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Author"
                      value={newBook.author}
                      onChange={(e) => setNewBook({ ...newBook, author: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                      required
                    />
                    <input
                      type="text"
                      placeholder="ISBN"
                      value={newBook.isbn}
                      onChange={(e) => setNewBook({ ...newBook, isbn: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                    />
                    <select
                      value={newBook.category_id}
                      onChange={(e) => setNewBook({ ...newBook, category_id: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                      required
                    >
                      <option value="">
                        {categories.length === 0 ? 'No categories yet' : 'Select Category'}
                      </option>
                      {categories.map((cat) => (
                        <option key={cat.category_id} value={cat.category_id}>
                          {cat.category_name}
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      placeholder="Publisher"
                      value={newBook.publisher}
                      onChange={(e) => setNewBook({ ...newBook, publisher: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                    />
                    <input
                      type="number"
                      placeholder="Quantity"
                      value={newBook.total_quantity}
                      onChange={(e) => setNewBook({ ...newBook, total_quantity: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                      required
                    />
                    <button
                      type="submit"
                      className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 font-semibold"
                    >
                      {loading ? '⏳ Adding Book...' : 'Add Book'}
                    </button>
                  </form>
                </div>
              </div>

              <div className="lg:col-span-2">
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="p-6 border-b">
                    <h2 className="text-xl font-bold">📖 Books List</h2>
                  </div>
                  <div className="overflow-x-auto">
                    {loading ? (
                      <div className="p-6 text-center">
                        <div className="inline-block">
                          <div className="animate-spin">⏳</div>
                          <p className="mt-2 text-gray-600">Loading books...</p>
                        </div>
                      </div>
                    ) : books.length === 0 ? (
                      <div className="p-6 text-center text-gray-500">No books added yet</div>
                    ) : (
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                          <tr>
                            <th className="px-6 py-3 text-left text-sm font-semibold">Title</th>
                            <th className="px-6 py-3 text-left text-sm font-semibold">Author</th>
                            <th className="px-6 py-3 text-left text-sm font-semibold">Category</th>
                            <th className="px-6 py-3 text-left text-sm font-semibold">Available</th>
                          </tr>
                        </thead>
                        <tbody>
                          {books.map((book) => (
                            <tr key={book.book_id} className="border-b hover:bg-gray-50">
                              <td className="px-6 py-4 text-sm">{book.title}</td>
                              <td className="px-6 py-4 text-sm">{book.author}</td>
                              <td className="px-6 py-4 text-sm">{book.category_name}</td>
                              <td className="px-6 py-4 text-sm">
                                <span className={book.available_quantity > 0 ? 'text-green-600 font-semibold' : 'text-red-600'}>
                                  {book.available_quantity}/{book.total_quantity}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Issues Tab */}
        {activeTab === 'issues' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4">📤 Issue Book</h2>
              <form onSubmit={handleIssueBook} className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                  required
                >
                  <option value="">{loading ? 'Loading students...' : 'Select Student'}</option>
                  {students.map((student) => (
                    <option key={student.student_id} value={student.student_id}>
                      {student.name}
                    </option>
                  ))}
                </select>
                <select
                  value={selectedBookId}
                  onChange={(e) => setSelectedBookId(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                  required
                >
                  <option value="">{loading ? 'Loading books...' : 'Select Book'}</option>
                  {books.filter((b) => b.available_quantity > 0).map((book) => (
                    <option key={book.book_id} value={book.book_id}>
                      {book.title}
                    </option>
                  ))}
                </select>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                  required
                />
                <button
                  type="submit"
                  className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 font-semibold"
                  disabled={loading}
                >
                  {loading ? '⏳ Issuing...' : 'Issue Book'}
                </button>
              </form>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-6 border-b">
                <h2 className="text-xl font-bold">📖 Active Issues</h2>
              </div>
              <div className="overflow-x-auto">
                {loading ? (
                  <div className="p-6 text-center">
                    <div className="inline-block">
                      <div className="animate-spin">⏳</div>
                      <p className="mt-2 text-gray-600">Loading active issues...</p>
                    </div>
                  </div>
                ) : activeIssues.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">No active issues</div>
                ) : (
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-6 py-3 text-left text-sm font-semibold">Student</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold">Book Title</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold">Issued Date</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold">Due Date</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeIssues.map((issue) => (
                        <tr key={issue.issue_id} className="border-b hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm">{issue.student_name}</td>
                          <td className="px-6 py-4 text-sm">{issue.title}</td>
                          <td className="px-6 py-4 text-sm">{new Date(issue.issue_date).toLocaleDateString()}</td>
                          <td className="px-6 py-4 text-sm">{new Date(issue.due_date).toLocaleDateString()}</td>
                          <td className="px-6 py-4 text-sm">
                            <button
                              onClick={() => handleReturnBook(issue.issue_id)}
                              className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 text-xs font-semibold"
                            >
                              ✓ Return
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            {overdueIssues.length > 0 && (
              <div className="bg-red-50 rounded-lg shadow overflow-hidden border-2 border-red-300">
                <div className="p-6 border-b bg-red-100">
                  <h2 className="text-xl font-bold text-red-700">⚠️ Overdue Issues ({overdueIssues.length})</h2>
                </div>
                <div className="overflow-x-auto">
                  {loading ? (
                    <div className="p-6 text-center">
                      <div className="inline-block">
                        <div className="animate-spin">⏳</div>
                        <p className="mt-2 text-gray-600">Loading overdue issues...</p>
                      </div>
                    </div>
                  ) : (
                    <table className="w-full">
                      <thead className="bg-red-100 border-b">
                        <tr>
                          <th className="px-6 py-3 text-left text-sm font-semibold">Student</th>
                          <th className="px-6 py-3 text-left text-sm font-semibold">Book Title</th>
                          <th className="px-6 py-3 text-left text-sm font-semibold">Due Date</th>
                          <th className="px-6 py-3 text-left text-sm font-semibold">Days Overdue</th>
                        </tr>
                      </thead>
                      <tbody>
                        {overdueIssues.map((issue) => (
                          <tr key={issue.issue_id} className="border-b bg-red-50 hover:bg-red-100">
                            <td className="px-6 py-4 text-sm font-semibold">{issue.student_name}</td>
                            <td className="px-6 py-4 text-sm">{issue.title}</td>
                            <td className="px-6 py-4 text-sm">{new Date(issue.due_date).toLocaleDateString()}</td>
                            <td className="px-6 py-4 text-sm font-semibold text-red-600">
                              {Math.floor((new Date() - new Date(issue.due_date)) / (1000 * 60 * 60 * 24))} days
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
