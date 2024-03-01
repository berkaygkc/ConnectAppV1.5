class DeleteDetailCellRenderer {
    init(params) {
        this.eGui = document.createElement("a");
        this.eGui.href = "#";
        this.eGui.innerHTML = `
                <i class="fa-solid fa-trash text-danger"></i>
        `;

        this.eventListener = () => {
            Swal.fire({
                title: "Emin misiniz?",
                icon: "question",
                text: "İlgili vergiyi silmek istediğinize emin misiniz?",
                showCancelButton: true,
                confirmButtonColor: "#d33",
                cancelButtonColor: "#3085d6",
                confirmButtonText: "Evet eminim, Sil",
                cancelButtonText: "Hayır, Silme",
            })
                .then((result) => {
                    if (result.isConfirmed) {
                        params.api.applyTransaction({
                            remove: [params.node.data],
                        });
                    }
                })
                .catch((err) => {});
        };
        this.eGui.addEventListener("click", this.eventListener);
    }

    getGui() {
        return this.eGui;
    }

    destroy() {
        if (this.eGui) {
            this.eGui.removeEventListener("click", this.eventListener);
        }
    }
}
