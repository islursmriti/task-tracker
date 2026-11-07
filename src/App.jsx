//v2
import React, { useState, useEffect } from "react";
import "./App.css";

export default function HabitTracker() {
  // ---------------- DATE INFO ----------------
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();

  const currentMonthKey = `${year}-${month + 1}`;

  // ---------------- TASKS ----------------
  const [tasks, setTasks] = useState(() => {
    try {
      const saved = localStorage.getItem("tasks");
      const parsed = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  const [input, setInput] = useState("");

  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && input.trim() !== "") {
      setTasks((prev) => [...prev, input.trim()]);
      setInput("");
    }
  };

  const deleteTask = (indexToDelete) => {
    setTasks((prev) => prev.filter((_, i) => i !== indexToDelete));
  };

  // ---------------- HISTORY ----------------
  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem("tracker-history");
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    localStorage.setItem(
      "tracker-history",
      JSON.stringify(history)
    );
  }, [history]);

  // ---------------- CALENDAR ----------------
  const [checkedDays, setCheckedDays] = useState(() => {
    try {
      const saved = localStorage.getItem("tracker-data");

      if (!saved) return {};

      const parsed = JSON.parse(saved);

      if (parsed.month === currentMonthKey) {
        return parsed.checkedDays || {};
      }

      return {};
    } catch {
      return {};
    }
  });

  const [showMonthPopup, setShowMonthPopup] =
    useState(false);

  const [previousMonthScore, setPreviousMonthScore] =
    useState(0);

  // Detect month rollover
  useEffect(() => {
    try {
      const saved = localStorage.getItem("tracker-data");

      if (!saved) return;

      const parsed = JSON.parse(saved);

      if (
        parsed.month &&
        parsed.month !== currentMonthKey
      ) {
        const oldScore = Object.values(
          parsed.checkedDays || {}
        ).filter(Boolean).length;

        setHistory((prev) => ({
          ...prev,
          [parsed.month]: oldScore,
        }));

        setPreviousMonthScore(oldScore);

        localStorage.setItem(
          "tracker-data",
          JSON.stringify({
            month: currentMonthKey,
            checkedDays: {},
          })
        );

        setCheckedDays({});
        setShowMonthPopup(true);
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  // Save calendar
  useEffect(() => {
    localStorage.setItem(
      "tracker-data",
      JSON.stringify({
        month: currentMonthKey,
        checkedDays,
      })
    );
  }, [checkedDays, currentMonthKey]);

  const toggleDay = (day) => {
    setCheckedDays((prev) => ({
      ...prev,
      [day]: !prev[day],
    }));
  };

  const totalChecked = Object.values(
    checkedDays
  ).filter(Boolean).length;

  // ---------------- CALENDAR GRID ----------------
  const daysInMonth = new Date(
    year,
    month + 1,
    0
  ).getDate();

  const firstDay = new Date(
    year,
    month,
    1
  ).getDay();

  const daysArray = [];

  for (let i = 0; i < firstDay; i++) {
    daysArray.push(null);
  }

  for (let i = 1; i <= daysInMonth; i++) {
    daysArray.push(i);
  }

  // ---------------- UI ----------------
  return (
    <div className="container">
      <h1>Monthly Habit Tracker</h1>

      {/* Month End Popup */}
      {showMonthPopup && (
        <div className="modal">
          <div className="modal-content">
            <h2>Month Ended 🎉</h2>

            <p>Your score for last month:</p>

            <h3>
              {previousMonthScore} productive days
            </h3>

            <button
              onClick={() =>
                setShowMonthPopup(false)
              }
            >
              Start New Month
            </button>
          </div>
        </div>
      )}

      {/* Tasks */}
      <div className="tasks">
        <h2>Tasks</h2>

        <input
          type="text"
          placeholder="Type a habit and press Enter..."
          value={input}
          onChange={(e) =>
            setInput(e.target.value)
          }
          onKeyDown={handleKeyDown}
          style={{
            padding: "8px",
            font: "inherit",
            marginBottom: "10px",
            width: "250px",
          }}
        />

        <ul
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}
        >
          {tasks.map((task, index) => (
            <li
              key={index}
              style={{
                display: "flex",
                justifyContent:
                  "space-between",
                alignItems: "center",
                width: "250px",
              }}
            >
              {task}

              <button
                onClick={() =>
                  deleteTask(index)
                }
                style={{
                  marginLeft: "10px",
                  cursor: "pointer",
                  border: "none",
                  padding: "4px 8px",
                  borderRadius: "5px",
                }}
              >
                ❌
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Calendar */}
      <div className="calendar">
        <h2>
          {today.toLocaleString(
            "default",
            { month: "long" }
          )}{" "}
          {year}
        </h2>

        <div className="days">
          {[
            "Sun",
            "Mon",
            "Tue",
            "Wed",
            "Thu",
            "Fri",
            "Sat",
          ].map((d) => (
            <div
              key={d}
              className="day-name"
            >
              {d}
            </div>
          ))}
        </div>

        <div className="grid">
          {daysArray.map((day, index) => (
            <div
              key={index}
              className="cell"
            >
              {day && (
                <button
                  className={`day-btn ${
                    checkedDays[day]
                      ? "active"
                      : ""
                  }`}
                  onClick={() =>
                    toggleDay(day)
                  }
                >
                  {day}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <h3>
        Total Productive Days this month:{" "}
        {totalChecked}
      </h3>

      {/* History */}
      {Object.keys(history).length > 0 && (
        <div
          style={{
            marginTop: "30px",
          }}
        >
          <h3>Previous Scores</h3>

          {Object.entries(history)
            .reverse()
            .map(([month, score]) => (
              <div key={month}>
                {month}: {score} days
              </div>
            ))}
        </div>
      )}
    </div>
  );
}

//v1
// import React, { useState, useEffect } from "react";
// import "./App.css";

// //           {/* <li>Solve atleast 1 coding problem/Read the soln and solve later</li> */}
// //           {/* <li>Play Games / Doom Scrolling</li> */}
// //           {/* <li>Exercise / Learn new physical skill</li> */}

// export default function HabitTracker() {
//   // ✅ Load habits from localStorage
// const [tasks, setTasks] = useState(() => {
//   try {
//     const saved = localStorage.getItem("tasks");
//     const parsed = saved ? JSON.parse(saved) : [];

//     // ✅ Ensure it's always an array
//     return Array.isArray(parsed) ? parsed : [];
//   } catch {
//     return [];
//   }
// });

//   const [input, setInput] = useState("");

//   // ✅ Save habits
//   useEffect(() => {
//     localStorage.setItem("tasks", JSON.stringify(tasks));
//   }, [tasks]);

//   // ✅ Add habit on Enter
//   const handleKeyDown = (e) => {
//     if (e.key === "Enter" && input.trim() !== "") {
//       setTasks((prev) => [...prev, input.trim()]);
//       setInput("");
//     }
//   };

//   // ✅ Delete habit
//   const deleteTask = (indexToDelete) => {
//     setTasks((prev) => prev.filter((_, i) => i !== indexToDelete));
//   };

//   // ---------------- Calendar Logic (UNCHANGED) ----------------
//   const [checkedDays, setCheckedDays] = useState(() => {
//     const saved = localStorage.getItem("tracker-data");
//     return saved ? JSON.parse(saved) : {};
//   });

//   useEffect(() => {
//     localStorage.setItem("tracker-data", JSON.stringify(checkedDays));
//   }, [checkedDays]);

//   const today = new Date();
//   const year = today.getFullYear();
//   const month = today.getMonth();

//   const daysInMonth = new Date(year, month + 1, 0).getDate();
//   const firstDay = new Date(year, month, 1).getDay();

//   const toggleDay = (day) => {
//     setCheckedDays((prev) => ({
//       ...prev,
//       [day]: !prev[day],
//     }));
//   };

//   const totalChecked = Object.values(checkedDays).filter(Boolean).length;

//   const daysArray = [];

//   for (let i = 0; i < firstDay; i++) {
//     daysArray.push(null);
//   }

//   for (let i = 1; i <= daysInMonth; i++) {
//     daysArray.push(i);
//   }

//   // ---------------- UI ----------------
//   return (
//     <div className="container">
//       <h1>Monthly Habit Tracker</h1>

//       {/* Tasks Section */}
//       <div className="tasks">
//         <h2>Tasks</h2>

//         {/* Input */}
//         <input
//           type="text"
//           placeholder="Type a habit and press Enter..."
//           value={input}
//           onChange={(e) => setInput(e.target.value)}
//           onKeyDown={handleKeyDown}
//           style={{
//             padding: "8px",
//             font: "inherit",
//             marginBottom: "10px",
//             width: "250px",
//           }}
//         />

//         {/* List */}
//         <ul style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
//           {tasks.map((task, index) => (
//             <li
//               key={index}
//               style={{
//                 display: "flex",
//                 justifyContent: "space-between",
//                 alignItems: "center",
//                 width: "250px",
//               }}
//             >
//               {task}

//               <button
//                 onClick={() => deleteTask(index)}
//                 style={{
//                   marginLeft: "10px",
//                   cursor: "pointer",
//                   // background: "red",
//                   // color: "white",
//                   border: "none",
//                   padding: "4px 8px",
//                   borderRadius: "5px",
//                 }}
//               >
//                 ❌
//               </button>
//             </li>
//           ))}
//         </ul>
//       </div>

//       {/* Calendar */}
//       <div className="calendar">
//         <h2>
//           {today.toLocaleString("default", { month: "long" })} {year}
//         </h2>

//         <div className="days">
//           {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
//             <div key={d} className="day-name">
//               {d}
//             </div>
//           ))}
//         </div>

//         <div className="grid">
//           {daysArray.map((day, index) => (
//             <div key={index} className="cell">
//               {day && (
//                 <button
//                   className={`day-btn ${checkedDays[day] ? "active" : ""}`}
//                   onClick={() => toggleDay(day)}
//                 >
//                   {day}
//                 </button>
//               )}
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* Total */}
//       <h3>Total Productive Days per month: {totalChecked}</h3>
//     </div>
//   );
// }

// import React, { useState, useEffect, useRef } from "react";
// import "./App.css";

// export default function HabitTracker() {
//   // localStorage: checked days
//   const [checkedDays, setCheckedDays] = useState(() => {
//     const saved = localStorage.getItem("tracker-data");
//     return saved ? JSON.parse(saved) : {};
//   });

//   // localStorage: tasks
//   const [tasks, setTasks] = useState({
//     task1: localStorage.getItem("task1") || "",
//     task2: localStorage.getItem("task2") || "",
//     task3: localStorage.getItem("task3") || "",
//   });

//   // hidden span refs for exact width measurement
//   const spanRef1 = useRef(null);
//   const spanRef2 = useRef(null);
//   const spanRef3 = useRef(null);

//   const [widths, setWidths] = useState({
//     task1: 10,
//     task2: 10,
//     task3: 10,
//   });

//   // update task values
//   const handleChange = (e) => {
//     const { name, value } = e.target;

//     setTasks((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//   };

//   // exact width measurement
//   useEffect(() => {
//     setWidths({
//       task1: Math.max((spanRef1.current?.offsetWidth || 0) + 2, 60),
//       task2: Math.max((spanRef2.current?.offsetWidth || 0) + 2, 60),
//       task3: Math.max((spanRef3.current?.offsetWidth || 0) + 2, 60),
//     });
//   }, [tasks]);

//   // save checked days
//   useEffect(() => {
//     localStorage.setItem("tracker-data", JSON.stringify(checkedDays));
//   }, [checkedDays]);

//   // save tasks
//   useEffect(() => {
//     localStorage.setItem("task1", tasks.task1);
//     localStorage.setItem("task2", tasks.task2);
//     localStorage.setItem("task3", tasks.task3);
//   }, [tasks]);

//   // calendar logic
//   const today = new Date();
//   const year = today.getFullYear();
//   const month = today.getMonth();

//   const daysInMonth = new Date(year, month + 1, 0).getDate();
//   const firstDay = new Date(year, month, 1).getDay();

//   const toggleDay = (day) => {
//     setCheckedDays((prev) => ({
//       ...prev,
//       [day]: !prev[day],
//     }));
//   };

//   const totalChecked = Object.values(checkedDays).filter(Boolean).length;

//   const daysArray = [];

//   for (let i = 0; i < firstDay; i++) {
//     daysArray.push(null);
//   }

//   for (let i = 1; i <= daysInMonth; i++) {
//     daysArray.push(i);
//   }

//   return (
//     <div className="container">
//       {/* hidden spans for exact text measurement */}
//       <span
//         ref={spanRef1}
//         style={{
//           position: "absolute",
//           visibility: "hidden",
//           whiteSpace: "pre",
//           font: "inherit",
//         }}
//       >
//         {tasks.task1 || " "}
//       </span>

//       <span
//         ref={spanRef2}
//         style={{
//           position: "absolute",
//           visibility: "hidden",
//           whiteSpace: "pre",
//           font: "inherit",
//         }}
//       >
//         {tasks.task2 || " "}
//       </span>

//       <span
//         ref={spanRef3}
//         style={{
//           position: "absolute",
//           visibility: "hidden",
//           whiteSpace: "pre",
//           font: "inherit",
//         }}
//       >
//         {tasks.task3 || " "}
//       </span>

//       <h1>Habit Tracker</h1>

//       {/* Tasks */}
//       <div className="tasks">
//         <h2>Tasks</h2>

//         <ul style={{display: 'flex', flexDirection: 'column',gap: '10px'}}>
//           <li>
//             <input
//               type="text"
//               name="task1"
//               value={tasks.task1}
//               onChange={handleChange}
//               style={{
//                 width: `${widths.task1}px`,
//                 padding: "8px",
//                 font: "inherit",
//                 boxSizing: "content-box",
//               }}
//             />
//           </li>

//           <li>
//             <input
//               type="text"
//               name="task2"
//               value={tasks.task2}
//               onChange={handleChange}
//               style={{
//                 width: `${widths.task2}px`,
//                 padding: "8px",
//                 font: "inherit",
//                 boxSizing: "content-box",
//               }}
//             />
//           </li>

//           <li>
//             <input
//               type="text"
//               name="task3"
//               value={tasks.task3}
//               onChange={handleChange}
//               style={{
//                 width: `${widths.task3}px`,
//                 padding: "8px",
//                 font: "inherit",
//                 boxSizing: "content-box",
//               }}
//             />
//           </li>
//         </ul>
//       </div>

//       {/* Calendar */}
//       <div className="calendar">
//         <h2>
//           {today.toLocaleString("default", { month: "long" })} {year}
//         </h2>

//         <div className="days">
//           {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
//             <div key={d} className="day-name">
//               {d}
//             </div>
//           ))}
//         </div>

//         <div className="grid">
//           {daysArray.map((day, index) => (
//             <div key={index} className="cell">
//               {day && (
//                 <button
//                   className={`day-btn ${checkedDays[day] ? "active" : ""}`}
//                   onClick={() => toggleDay(day)}
//                 >
//                   {day}
//                 </button>
//               )}
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* Total */}
//       <h3>Total Productive Days per month : {totalChecked}</h3>
//     </div>
//   );
// }