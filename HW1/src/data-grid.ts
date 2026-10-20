import type { DataGridProps } from "./data-grid-contract";

type GridItem = object;
export function createDataGrid<T extends GridItem>(
  props: DataGridProps<T>,
): HTMLElement {
  const { data, columns, ariaLabel, onRowSelect } = props;

  const table = document.createElement("table");
  table.className = "data-grid";
  table.setAttribute("role", "grid");
  table.setAttribute("aria-label", ariaLabel);
  table.setAttribute("aria-rowcount", String(data.length + 1));
  table.setAttribute("aria-colcount", String(columns.length + 1));

  const caption = document.createElement("caption");
  caption.className = "sr-only";
  caption.textContent = ariaLabel;
  table.append(caption);

  const thead = document.createElement("thead");
  const headerRow = document.createElement("tr");
  headerRow.setAttribute("role", "row");

  const selectHeader = document.createElement("th");
  selectHeader.scope = "col";
  selectHeader.textContent = "Select";
  selectHeader.setAttribute("role", "columnheader");
  headerRow.append(selectHeader);

  const tbody = document.createElement("tbody");
  tbody.setAttribute("role", "rowgroup");

  let filterText = "";
  let sortKey: keyof T | null = null;
  let sortDirection: "ascending" | "descending" = "ascending";
  let currentPage = 1;
  let pageSize = 5;
  let activeRow = 0;
  let activeColumn = 0;
  const selectedItems = new Set<T>();

  const filterLabel = document.createElement("label");
  filterLabel.htmlFor = "grid-filter";
  filterLabel.textContent = "Filter rows";

  const filterInput = document.createElement("input");
  filterInput.id = "grid-filter";
  filterInput.type = "search";
  filterInput.placeholder = "Search all columns...";
  filterInput.setAttribute("aria-label", "Filter rows by keyword");

  const pageSizeLabel = document.createElement("label");
  pageSizeLabel.htmlFor = "grid-page-size";
  pageSizeLabel.textContent = "Rows per page";

  const pageSizeSelect = document.createElement("select");
  pageSizeSelect.id = "grid-page-size";
  pageSizeSelect.setAttribute("aria-label", "Rows per page");

  for (const size of [5, 10, 20]) {
    const option = document.createElement("option");
    option.value = String(size);
    option.textContent = String(size);
    pageSizeSelect.append(option);
  }

  const toolbar = document.createElement("section");
  toolbar.className = "grid-toolbar";
  toolbar.setAttribute("aria-label", "Grid controls");

  const filterGroup = document.createElement("div");
  filterGroup.className = "control-group";
  filterGroup.append(filterLabel, filterInput);

  const pageSizeGroup = document.createElement("div");
  pageSizeGroup.className = "control-group";
  pageSizeGroup.append(pageSizeLabel, pageSizeSelect);

  toolbar.append(filterGroup, pageSizeGroup);

  const tableWrapper = document.createElement("div");
  tableWrapper.className = "table-wrapper";
  tableWrapper.append(table);

  const pagination = document.createElement("nav");
  pagination.className = "pagination";
  pagination.setAttribute("aria-label", "Data grid pagination");

  const pageInfo = document.createElement("p");
  pageInfo.className = "page-info";
  pageInfo.setAttribute("aria-live", "polite");

  const previousButton = document.createElement("button");
  previousButton.type = "button";
  previousButton.textContent = "Previous";

  const nextButton = document.createElement("button");
  nextButton.type = "button";
  nextButton.textContent = "Next";

  const pageButtons = document.createElement("div");
  pageButtons.className = "page-buttons";

  pagination.append(previousButton, pageInfo, nextButton, pageButtons);

  function getFilteredData(): T[] {
    const filtered = data.filter((item) =>
      columns.some((column) =>
        String(item[column.accessorKey] ?? "")
          .toLowerCase()
          .includes(filterText.toLowerCase()),
      ),
    );

    if (sortKey !== null) {
      filtered.sort((a, b) => {
        const left = a[sortKey!];
        const right = b[sortKey!];

        let comparison: number;

        if (typeof left === "number" && typeof right === "number") {
          comparison = left - right;
        } else {
          comparison = String(left ?? "").localeCompare(
            String(right ?? ""),
            undefined,
            { numeric: true, sensitivity: "base" },
          );
        }

        return sortDirection === "ascending" ? comparison : -comparison;
      });
    }

    return filtered;
  }

  function createCell(
    text: string,
    rowIndex: number,
    columnIndex: number,
  ): HTMLTableCellElement {
    const cell = document.createElement("td");
    cell.setAttribute("role", "gridcell");
    cell.tabIndex =
      rowIndex === activeRow && columnIndex === activeColumn ? 0 : -1;
    cell.textContent = text;
    return cell;
  }

  function renderRows(): void {
    const filtered = getFilteredData();
    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

    currentPage = Math.min(currentPage, totalPages);
    const start = (currentPage - 1) * pageSize;
    const pageData = filtered.slice(start, start + pageSize);

    tbody.replaceChildren();

    if (pageData.length === 0) {
      const row = document.createElement("tr");
      row.setAttribute("role", "row");

      const cell = document.createElement("td");
      cell.colSpan = columns.length + 1;
      cell.textContent = "No matching records found.";
      cell.setAttribute("role", "gridcell");

      row.append(cell);
      tbody.append(row);
    }

    pageData.forEach((item, rowIndex) => {
      const row = document.createElement("tr");
      row.setAttribute("role", "row");
      row.setAttribute("aria-selected", String(selectedItems.has(item)));
      row.classList.toggle("is-selected", selectedItems.has(item));

      const selectCell = document.createElement("td");
      selectCell.setAttribute("role", "gridcell");

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = selectedItems.has(item);
      checkbox.setAttribute("aria-label", `Select row ${start + rowIndex + 1}`);

      checkbox.addEventListener("change", () => {
        toggleSelection(item);
      });

      selectCell.append(checkbox);
      row.append(selectCell);

      columns.forEach((column, columnIndex) => {
        const value = item[column.accessorKey];
        const cell = createCell(String(value ?? ""), rowIndex, columnIndex);

        cell.tabIndex =
          rowIndex === activeRow && columnIndex === activeColumn ? 0 : -1;

        row.append(cell);
      });
      row.addEventListener("click", (event) => {
        if ((event.target as HTMLElement).closest("input")) return;
        activeRow = rowIndex;
        onRowSelect?.(item);
        renderRows();
      });

      tbody.append(row);
    });

    pageInfo.textContent = `Page ${currentPage} of ${totalPages} · ${filtered.length} records`;

    previousButton.disabled = currentPage <= 1;
    nextButton.disabled = currentPage >= totalPages;

    pageButtons.replaceChildren();

    for (let page = 1; page <= totalPages; page++) {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = String(page);
      button.setAttribute("aria-label", `Page ${page}`);
      button.setAttribute("aria-current", String(page === currentPage));
      button.disabled = page === currentPage;

      button.addEventListener("click", () => {
        currentPage = page;
        activeRow = 0;
        renderRows();
      });

      pageButtons.append(button);
    }

    table.setAttribute("aria-rowcount", String(filtered.length + 1));
  }

  function toggleSelection(item: T): void {
    if (selectedItems.has(item)) {
      selectedItems.delete(item);
    } else {
      selectedItems.add(item);
    }

    onRowSelect?.(item);
    renderRows();
  }

  columns.forEach((column) => {
    const header = document.createElement("th");
    header.scope = "col";
    header.setAttribute("role", "columnheader");

    if (column.sortable) {
      const sortButton = document.createElement("button");
      sortButton.type = "button";
      sortButton.className = "sort-button";
      sortButton.textContent = column.header;
      sortButton.setAttribute("aria-label", `Sort by ${column.header}`);

      sortButton.addEventListener("click", () => {
        if (sortKey === column.accessorKey) {
          sortDirection =
            sortDirection === "ascending" ? "descending" : "ascending";
        } else {
          sortKey = column.accessorKey;
          sortDirection = "ascending";
        }

        currentPage = 1;

        for (const th of Array.from(headerRow.querySelectorAll("th"))) {
          th.removeAttribute("aria-sort");
        }

        header.setAttribute("aria-sort", sortDirection);
        sortButton.textContent = `${column.header} ${sortDirection === "ascending" ? "↑" : "↓"}`;

        renderRows();
      });

      header.append(sortButton);
    } else {
      header.textContent = column.header;
    }

    headerRow.append(header);
  });

  thead.append(headerRow);
  table.append(thead, tbody);

  filterInput.addEventListener("input", () => {
    filterText = filterInput.value.trim();
    currentPage = 1;
    activeRow = 0;
    renderRows();
  });

  pageSizeSelect.addEventListener("change", () => {
    pageSize = Number(pageSizeSelect.value);
    currentPage = 1;
    renderRows();
  });

  previousButton.addEventListener("click", () => {
    currentPage = Math.max(1, currentPage - 1);
    renderRows();
  });

  nextButton.addEventListener("click", () => {
    const totalPages = Math.ceil(getFilteredData().length / pageSize);
    currentPage = Math.min(totalPages, currentPage + 1);
    renderRows();
  });

  table.addEventListener("keydown", (event: KeyboardEvent) => {
    const cells = Array.from(
      tbody.querySelectorAll<HTMLElement>('[role="gridcell"]'),
    ).filter((cell) => !cell.querySelector("input"));

    const focusedCell = document.activeElement as HTMLElement;
    const index = cells.indexOf(focusedCell);

    if (index < 0) return;

    const rowLength = columns.length;
    let nextIndex = index;

    switch (event.key) {
      case "ArrowRight":
        nextIndex = Math.min(cells.length - 1, index + 1);
        break;
      case "ArrowLeft":
        nextIndex = Math.max(0, index - 1);
        break;
      case "ArrowDown":
        nextIndex = Math.min(cells.length - 1, index + rowLength);
        break;
      case "ArrowUp":
        nextIndex = Math.max(0, index - rowLength);
        break;
      case "Enter": {
        event.preventDefault();
        const row = focusedCell.closest("tr");
        if (row) {
          const visibleIndex = Array.from(tbody.rows).indexOf(row);
          const item =
            getFilteredData()[(currentPage - 1) * pageSize + visibleIndex];
          if (item) onRowSelect?.(item);
        }
        return;
      }
      case " ":
      case "Spacebar": {
        event.preventDefault();
        const row = focusedCell.closest("tr");
        if (row) {
          const visibleIndex = Array.from(tbody.rows).indexOf(row);
          const item =
            getFilteredData()[(currentPage - 1) * pageSize + visibleIndex];
          if (item) toggleSelection(item);
        }
        return;
      }
      default:
        return;
    }

    event.preventDefault();
    cells[nextIndex]?.focus();
  });

  const root = document.createElement("section");
  root.className = "data-grid-component";
  root.append(toolbar, tableWrapper, pagination);

  renderRows();

  return root;
}
