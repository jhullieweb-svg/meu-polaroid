/* =========================================================
   MEU POLAROID
   VERSÃO COM PAINEL LATERAL
========================================================= */


/* =========================================================
   CONFIGURAÇÕES A4
========================================================= */

const PHOTOS_PER_PAGE = 9;

const PAPER_WIDTH = 794;
const PAPER_HEIGHT = 1123;


/*
   Polaroid:
   7 cm × 9 cm aproximadamente

   794 px / 21 cm ≈ 37.8 px por cm

   7 cm ≈ 265 px
   9 cm ≈ 340 px
*/

const POLAROID_WIDTH = 265;
const POLAROID_HEIGHT = 340;


/*
   Área da fotografia.
   Deixa espaço superior e principalmente
   espaço inferior para o formato clássico.
*/

const PHOTO_WIDTH = 235;
const PHOTO_HEIGHT = 258;

const PHOTO_MARGIN_X = 15;
const PHOTO_MARGIN_TOP = 15;


/*
   A4 para PDF.
*/

const PDF_WIDTH_MM = 210;
const PDF_HEIGHT_MM = 297;


/* =========================================================
   ELEMENTOS
========================================================= */

const fileInput =
    document.getElementById("fileInput");

const pagesContainer =
    document.getElementById("pages");

const emptyState =
    document.getElementById("emptyState");

const photoCount =
    document.getElementById("photoCount");

const clearAllButton =
    document.getElementById("clearAll");

const generatePdfButton =
    document.getElementById("generatePdf");


/* =========================================================
   PAINEL LATERAL
========================================================= */

const settingsPanel =
    document.getElementById("settingsPanel");

const editingPhotoTitle =
    document.getElementById("editingPhotoTitle");

const editingPhotoName =
    document.getElementById("editingPhotoName");


/* =========================================================
   ABAS
========================================================= */

const tabFraming =
    document.getElementById("tabFraming");

const tabCaption =
    document.getElementById("tabCaption");

const framingEditor =
    document.getElementById("framingEditor");

const captionEditor =
    document.getElementById("captionEditor");


/* =========================================================
   ENQUADRAMENTO
========================================================= */

const zoomOut =
    document.getElementById("zoomOut");

const zoomIn =
    document.getElementById("zoomIn");

const rotatePhotoButton =
    document.getElementById("rotatePhoto");

const resetPhotoButton =
    document.getElementById("resetPhoto");

const globalZoomValue =
    document.getElementById("globalZoomValue");


/* =========================================================
   LEGENDA
========================================================= */

const captionInput =
    document.getElementById("captionInput");

const fontSelect =
    document.getElementById("fontSelect");

const fontSizeSelect =
    document.getElementById("fontSizeSelect");

const boldButton =
    document.getElementById("boldButton");

const italicButton =
    document.getElementById("italicButton");

const alignmentButtons =
    document.querySelectorAll(".align-button");


/* =========================================================
   DADOS
========================================================= */

let photos = [];

let editingPhotoIndex = null;

let currentMode = "framing";


/*
   Guarda a referência da imagem renderizada
   de cada Polaroid.
*/

const photoViews = new Map();


/* =========================================================
   UPLOAD
========================================================= */

fileInput.addEventListener(
    "change",
    function () {

        const files =
            Array.from(this.files);


        if (!files.length) {
            return;
        }


        files.forEach(file => {

            if (
                !file.type ||
                !file.type.startsWith("image/")
            ) {
                return;
            }


            const url =
                URL.createObjectURL(file);


            photos.push({

                url: url,

                name: file.name,

                x: 0,

                y: 0,

                scale: 1,

                rotation: 0,

                baseWidth: 0,

                baseHeight: 0,

                caption: "",

                fontFamily: "Arial",

                fontSize: 18,

                bold: false,

                italic: false,

                align: "center"

            });

        });


        /*
           Permite selecionar novamente
           a mesma foto.
        */

        this.value = "";


        renderPhotos();

    }
);


/* =========================================================
   CONTADOR
========================================================= */

function updatePhotoCount() {

    if (photos.length === 0) {

        photoCount.textContent =
            "Nenhuma foto adicionada";

        return;
    }


    if (photos.length === 1) {

        photoCount.textContent =
            "1 foto adicionada";

        return;
    }


    photoCount.textContent =
        `${photos.length} fotos adicionadas`;
}


/* =========================================================
   RENDERIZAR TUDO
========================================================= */

function renderPhotos() {

    pagesContainer.innerHTML = "";

    photoViews.clear();


    updatePhotoCount();


    emptyState.style.display =
        photos.length === 0
            ? "block"
            : "none";


    if (photos.length === 0) {

        closeSettings();

        return;
    }


    for (
        let start = 0;
        start < photos.length;
        start += PHOTOS_PER_PAGE
    ) {

        const pagePhotos =
            photos.slice(
                start,
                start + PHOTOS_PER_PAGE
            );


        const page =
            createPage(
                pagePhotos,
                start
            );


        pagesContainer.appendChild(page);

    }
}


/* =========================================================
   CRIAR PÁGINA
========================================================= */

function createPage(
    pagePhotos,
    startIndex
) {

    const paper =
        document.createElement("div");


    paper.className =
        "paper";


    pagePhotos.forEach(
        (photo, index) => {

            const globalIndex =
                startIndex + index;


            const polaroid =
                createPolaroid(
                    photo,
                    globalIndex,
                    index
                );


            paper.appendChild(
                polaroid
            );

        }
    );


    return paper;
}


/* =========================================================
   POSIÇÃO DOS 9 POLAROIDS
========================================================= */

function getPolaroidPosition(index) {

    const row =
        Math.floor(index / 3);

    const column =
        index % 3;


    /*
       Calculamos os espaços automaticamente
       para caberem 3 × 3 na folha.
    */

    const freeWidth =
        PAPER_WIDTH -
        (POLAROID_WIDTH * 3);


    const freeHeight =
        PAPER_HEIGHT -
        (POLAROID_HEIGHT * 3);


    const gapX =
        freeWidth / 4;


    const gapY =
        freeHeight / 4;


    const left =
        gapX +
        column *
        (POLAROID_WIDTH + gapX);


    const top =
        gapY +
        row *
        (POLAROID_HEIGHT + gapY);


    return {
        left,
        top
    };
}


/* =========================================================
   CRIAR POLAROID
========================================================= */

function createPolaroid(
    photo,
    photoIndex,
    positionIndex
) {

    const polaroid =
        document.createElement("div");


    polaroid.className =
        "polaroid";


    const position =
        getPolaroidPosition(
            positionIndex
        );


    polaroid.style.left =
        `${position.left}px`;


    polaroid.style.top =
        `${position.top}px`;


    /*
       Linha de corte.
    */

    const cutLine =
        document.createElement("div");


    cutLine.className =
        "cut-line";


    polaroid.appendChild(
        cutLine
    );


    /* =====================================================
       BOTÃO ENQUADRAMENTO
    ====================================================== */

    const frameButton =
        document.createElement("button");


    frameButton.type =
        "button";


    frameButton.className =
        "edit-frame-button";


    frameButton.textContent =
        "🖼️";


    frameButton.title =
        "Editar enquadramento";


    frameButton.addEventListener(
        "click",
        function (event) {

            event.stopPropagation();


            openSettings(
                photoIndex,
                "framing"
            );

        }
    );


    polaroid.appendChild(
        frameButton
    );


    /* =====================================================
       ÁREA DA FOTO
    ====================================================== */

    const photoFrame =
        document.createElement("div");


    photoFrame.className =
        "photo-frame";


    const img =
        document.createElement("img");


    img.src =
        photo.url;


    img.alt =
        photo.name;


    photoFrame.appendChild(
        img
    );


    polaroid.appendChild(
        photoFrame
    );


    /* =====================================================
       LEGENDA
    ====================================================== */

    const captionArea =
        document.createElement("div");


    captionArea.className =
        "caption-area";


    const captionText =
        document.createElement("div");


    captionText.className =
        "caption-text";


    captionArea.appendChild(
        captionText
    );


    polaroid.appendChild(
        captionArea
    );


    /* =====================================================
       BOTÃO DA LEGENDA
    ====================================================== */

    const captionButton =
        document.createElement("button");


    captionButton.type =
        "button";


    captionButton.className =
        "edit-caption-button";


    captionButton.textContent =
        "✏️";


    captionButton.title =
        "Editar legenda";


    captionButton.addEventListener(
        "click",
        function (event) {

            event.stopPropagation();


            openSettings(
                photoIndex,
                "caption"
            );

        }
    );


    polaroid.appendChild(
        captionButton
    );


    /* =====================================================
       CARREGAMENTO DA IMAGEM
    ====================================================== */

    img.addEventListener(
        "load",
        function () {

            setupImage(
                photo,
                img
            );


            const view = {

                img: img,

                caption: captionText

            };


            photoViews.set(
                photoIndex,
                view
            );


            updateImage(
                photo,
                img
            );


            updateCaption(
                photo,
                captionText
            );

        }
    );


    /*
       Arrastar.
    */

    enableDragging(
        photoFrame,
        photo,
        img
    );


    /*
       Se a imagem já estiver carregada
       pelo navegador.
    */

    if (img.complete) {

        setTimeout(
            () => {

                if (
                    img.naturalWidth
                ) {

                    setupImage(
                        photo,
                        img
                    );


                    const view = {

                        img: img,

                        caption: captionText

                    };


                    photoViews.set(
                        photoIndex,
                        view
                    );


                    updateImage(
                        photo,
                        img
                    );


                    updateCaption(
                        photo,
                        captionText
                    );

                }

            },
            0
        );

    }


    return polaroid;
}


/* =========================================================
   CONFIGURAR IMAGEM
========================================================= */

function setupImage(
    photo,
    img
) {

    if (
        !img.naturalWidth ||
        !img.naturalHeight
    ) {
        return;
    }


    const naturalWidth =
        img.naturalWidth;


    const naturalHeight =
        img.naturalHeight;


    /*
       "Cover":

       A imagem sempre cobre
       toda a área da foto.
    */

    const ratio =
        Math.max(
            PHOTO_WIDTH / naturalWidth,
            PHOTO_HEIGHT / naturalHeight
        );


    photo.baseWidth =
        naturalWidth * ratio;


    photo.baseHeight =
        naturalHeight * ratio;


    /*
       Só centraliza automaticamente
       quando ainda não existe enquadramento.
    */

    if (
        photo.x === 0 &&
        photo.y === 0 &&
        photo.scale === 1 &&
        photo.rotation === 0
    ) {

        centerPhoto(
            photo
        );

    }


    updateImage(
        photo,
        img
    );
}


/* =========================================================
   CENTRALIZAR
========================================================= */

function centerPhoto(photo) {

    if (
        !photo.baseWidth ||
        !photo.baseHeight
    ) {
        return;
    }


    const width =
        photo.baseWidth *
        photo.scale;


    const height =
        photo.baseHeight *
        photo.scale;


    photo.x =
        (
            PHOTO_WIDTH -
            width
        ) / 2;


    photo.y =
        (
            PHOTO_HEIGHT -
            height
        ) / 2;
}


/* =========================================================
   ATUALIZAR IMAGEM
========================================================= */

function updateImage(
    photo,
    img
) {

    if (
        !photo.baseWidth
    ) {
        return;
    }


    const width =
        photo.baseWidth *
        photo.scale;


    const height =
        photo.baseHeight *
        photo.scale;


    /*
       Limites para impedir
       que apareça espaço vazio.
    */

    const minX =
        Math.min(
            0,
            PHOTO_WIDTH - width
        );


    const maxX =
        Math.max(
            0,
            PHOTO_WIDTH - width
        );


    const minY =
        Math.min(
            0,
            PHOTO_HEIGHT - height
        );


    const maxY =
        Math.max(
            0,
            PHOTO_HEIGHT - height
        );


    photo.x =
        Math.max(
            minX,
            Math.min(
                maxX,
                photo.x
            )
        );


    photo.y =
        Math.max(
            minY,
            Math.min(
                maxY,
                photo.y
            )
        );


    img.style.width =
        `${width}px`;


    img.style.height =
        `${height}px`;


    img.style.left =
        `${photo.x}px`;


    img.style.top =
        `${photo.y}px`;


    img.style.transform =
        `rotate(${photo.rotation}deg)`;
}


/* =========================================================
   ARRASTAR FOTO
   MOUSE + TOUCHPAD + CELULAR
========================================================= */

function enableDragging(
    frame,
    photo,
    img
) {

    let dragging = false;

    let startX = 0;

    let startY = 0;

    let originalX = 0;

    let originalY = 0;


    frame.addEventListener(
        "pointerdown",
        function (event) {

            /*
               Só botão principal do mouse.
            */

            if (
                event.pointerType === "mouse" &&
                event.button !== 0
            ) {
                return;
            }


            dragging = true;


            startX =
                event.clientX;


            startY =
                event.clientY;


            originalX =
                photo.x;


            originalY =
                photo.y;


            frame.classList.add(
                "dragging"
            );


            try {

                frame.setPointerCapture(
                    event.pointerId
                );

            } catch (error) {}


            event.preventDefault();

        }
    );


    frame.addEventListener(
        "pointermove",
        function (event) {

            if (!dragging) {
                return;
            }


            const deltaX =
                event.clientX -
                startX;


            const deltaY =
                event.clientY -
                startY;


            /*
               O movimento do mouse
               precisa acompanhar a escala
               da folha na tela.

               Como a folha pode estar reduzida
               no celular, corrigimos o deslocamento.
            */

            const visualScale =
                frame.getBoundingClientRect().width /
                PHOTO_WIDTH;


            const safeScale =
                visualScale > 0
                    ? visualScale
                    : 1;


            photo.x =
                originalX +
                deltaX /
                safeScale;


            photo.y =
                originalY +
                deltaY /
                safeScale;


            updateImage(
                photo,
                img
            );

        }
    );


    function stopDragging(event) {

        if (!dragging) {
            return;
        }


        dragging = false;


        frame.classList.remove(
            "dragging"
        );


        try {

            if (
                frame.hasPointerCapture(
                    event.pointerId
                )
            ) {

                frame.releasePointerCapture(
                    event.pointerId
                );

            }

        } catch (error) {}

    }


    frame.addEventListener(
        "pointerup",
        stopDragging
    );


    frame.addEventListener(
        "pointercancel",
        stopDragging
    );


    frame.addEventListener(
        "lostpointercapture",
        function () {

            dragging = false;

            frame.classList.remove(
                "dragging"
            );

        }
    );
}


/* =========================================================
   ABRIR CONFIGURAÇÕES
========================================================= */

function openSettings(
    index,
    mode
) {

    const photo =
        photos[index];


    if (!photo) {
        return;
    }


    editingPhotoIndex =
        index;


    currentMode =
        mode;


    settingsPanel.classList.remove(
        "hidden"
    );


    editingPhotoTitle.textContent =
        mode === "framing"
            ? "🖼️ Editar enquadramento"
            : "✏️ Editar legenda";


    editingPhotoName.textContent =
        photo.name;


    loadPhotoSettings(
        photo
    );


    setMode(
        mode
    );


    /*
       No celular, leva o usuário
       para as configurações.
    */

    if (
        window.innerWidth <= 700
    ) {

        settingsPanel.scrollIntoView({
            behavior: "smooth",
            block: "nearest"
        });

    }
}


/* =========================================================
   FECHAR CONFIGURAÇÕES
========================================================= */

function closeSettings() {

    editingPhotoIndex =
        null;


    settingsPanel.classList.add(
        "hidden"
    );
}


/* =========================================================
   TROCAR MODO
========================================================= */

function setMode(mode) {

    currentMode =
        mode;


    const framing =
        mode === "framing";


    tabFraming.classList.toggle(
        "active",
        framing
    );


    tabCaption.classList.toggle(
        "active",
        !framing
    );


    framingEditor.classList.toggle(
        "hidden",
        !framing
    );


    captionEditor.classList.toggle(
        "hidden",
        framing
    );


    if (
        editingPhotoIndex !== null
    ) {

        const photo =
            photos[
                editingPhotoIndex
            ];


        if (photo) {

            editingPhotoTitle.textContent =
                framing
                    ? "🖼️ Editar enquadramento"
                    : "✏️ Editar legenda";


            updateZoomLabel(
                photo
            );

        }

    }
}


/* =========================================================
   ABAS
========================================================= */

tabFraming.addEventListener(
    "click",
    function () {

        if (
            editingPhotoIndex === null
        ) {
            return;
        }


        setMode(
            "framing"
        );

    }
);


tabCaption.addEventListener(
    "click",
    function () {

        if (
            editingPhotoIndex === null
        ) {
            return;
        }


        setMode(
            "caption"
        );

    }
);


/* =========================================================
   CARREGAR CONFIGURAÇÕES
========================================================= */

function loadPhotoSettings(photo) {

    captionInput.value =
        photo.caption;


    fontSelect.value =
        photo.fontFamily;


    fontSizeSelect.value =
        String(
            photo.fontSize
        );


    boldButton.classList.toggle(
        "active",
        photo.bold
    );


    italicButton.classList.toggle(
        "active",
        photo.italic
    );


    alignmentButtons.forEach(
        button => {

            button.classList.toggle(
                "active",
                button.dataset.align ===
                photo.align
            );

        }
    );


    updateZoomLabel(
        photo
    );
}


/* =========================================================
   ZOOM OUT
========================================================= */

zoomOut.addEventListener(
    "click",
    function () {

        if (
            editingPhotoIndex === null
        ) {
            return;
        }


        const photo =
            photos[
                editingPhotoIndex
            ];


        if (!photo) {
            return;
        }


        photo.scale =
            Math.max(
                0.5,
                photo.scale - 0.1
            );


        refreshCurrentPhoto();

    }
);


/* =========================================================
   ZOOM IN
========================================================= */

zoomIn.addEventListener(
    "click",
    function () {

        if (
            editingPhotoIndex === null
        ) {
            return;
        }


        const photo =
            photos[
                editingPhotoIndex
            ];


        if (!photo) {
            return;
        }


        photo.scale =
            Math.min(
                5,
                photo.scale + 0.1
            );


        refreshCurrentPhoto();

    }
);


/* =========================================================
   GIRAR
========================================================= */

rotatePhotoButton.addEventListener(
    "click",
    function () {

        if (
            editingPhotoIndex === null
        ) {
            return;
        }


        const photo =
            photos[
                editingPhotoIndex
            ];


        if (!photo) {
            return;
        }


        photo.rotation += 90;


        if (
            photo.rotation >= 360
        ) {

            photo.rotation = 0;

        }


        refreshCurrentPhoto();

    }
);


/* =========================================================
   CENTRALIZAR
========================================================= */

resetPhotoButton.addEventListener(
    "click",
    function () {

        if (
            editingPhotoIndex === null
        ) {
            return;
        }


        const photo =
            photos[
                editingPhotoIndex
            ];


        if (!photo) {
            return;
        }


        photo.scale = 1;

        photo.rotation = 0;


        centerPhoto(
            photo
        );


        refreshCurrentPhoto();

    }
);


/* =========================================================
   ATUALIZAR FOTO ATUAL
========================================================= */

function refreshCurrentPhoto() {

    if (
        editingPhotoIndex === null
    ) {
        return;
    }


    const photo =
        photos[
            editingPhotoIndex
        ];


    const view =
        photoViews.get(
            editingPhotoIndex
        );


    if (
        !photo ||
        !view
    ) {
        return;
    }


    updateImage(
        photo,
        view.img
    );


    updateZoomLabel(
        photo
    );
}


/* =========================================================
   ZOOM %
========================================================= */

function updateZoomLabel(photo) {

    if (!photo) {
        return;
    }


    globalZoomValue.textContent =
        `${Math.round(
            photo.scale * 100
        )}%`;
}


/* =========================================================
   LEGENDA
========================================================= */

function updateCaption(
    photo,
    element
) {

    if (!element) {
        return;
    }


    element.textContent =
        photo.caption || "";


    element.style.fontFamily =
        photo.fontFamily;


    element.style.fontSize =
        `${photo.fontSize}px`;


    element.style.fontWeight =
        photo.bold
            ? "bold"
            : "normal";


    element.style.fontStyle =
        photo.italic
            ? "italic"
            : "normal";


    element.style.textAlign =
        photo.align;
}


/* =========================================================
   ATUALIZAR TODAS AS LEGENDAS
========================================================= */

function refreshCaptions() {

    photoViews.forEach(
        view => {

            const index =
                findPhotoIndexByView(
                    view
                );


            if (
                index === -1
            ) {
                return;
            }


            updateCaption(
                photos[index],
                view.caption
            );

        }
    );
}


/*
   Descobre qual foto pertence
   a determinada view.
*/

function findPhotoIndexByView(view) {

    for (
        const [
            index,
            storedView
        ] of photoViews.entries()
    ) {

        if (
            storedView === view
        ) {

            return index;

        }

    }


    return -1;
}


/* =========================================================
   INPUT DA LEGENDA
========================================================= */

captionInput.addEventListener(
    "input",
    function () {

        if (
            editingPhotoIndex === null
        ) {
            return;
        }


        const photo =
            photos[
                editingPhotoIndex
            ];


        if (!photo) {
            return;
        }


        photo.caption =
            this.value;


        const view =
            photoViews.get(
                editingPhotoIndex
            );


        if (
            view &&
            view.caption
        ) {

            updateCaption(
                photo,
                view.caption
            );

        }

    }
);


/* =========================================================
   FONTE
========================================================= */

fontSelect.addEventListener(
    "change",
    function () {

        if (
            editingPhotoIndex === null
        ) {
            return;
        }


        const photo =
            photos[
                editingPhotoIndex
            ];


        if (!photo) {
            return;
        }


        photo.fontFamily =
            this.value;


        const view =
            photoViews.get(
                editingPhotoIndex
            );


        if (
            view &&
            view.caption
        ) {

            updateCaption(
                photo,
                view.caption
            );

        }

    }
);


/* =========================================================
   TAMANHO
========================================================= */

fontSizeSelect.addEventListener(
    "change",
    function () {

        if (
            editingPhotoIndex === null
        ) {
            return;
        }


        const photo =
            photos[
                editingPhotoIndex
            ];


        if (!photo) {
            return;
        }


        photo.fontSize =
            Number(
                this.value
            );


        const view =
            photoViews.get(
                editingPhotoIndex
            );


        if (
            view &&
            view.caption
        ) {

            updateCaption(
                photo,
                view.caption
            );

        }

    }
);


/* =========================================================
   NEGRITO
========================================================= */

boldButton.addEventListener(
    "click",
    function () {

        if (
            editingPhotoIndex === null
        ) {
            return;
        }


        const photo =
            photos[
                editingPhotoIndex
            ];


        if (!photo) {
            return;
        }


        photo.bold =
            !photo.bold;


        this.classList.toggle(
            "active",
            photo.bold
        );


        const view =
            photoViews.get(
                editingPhotoIndex
            );


        if (
            view &&
            view.caption
        ) {

            updateCaption(
                photo,
                view.caption
            );

        }

    }
);


/* =========================================================
   ITÁLICO
========================================================= */

italicButton.addEventListener(
    "click",
    function () {

        if (
            editingPhotoIndex === null
        ) {
            return;
        }


        const photo =
            photos[
                editingPhotoIndex
            ];


        if (!photo) {
            return;
        }


        photo.italic =
            !photo.italic;


        this.classList.toggle(
            "active",
            photo.italic
        );


        const view =
            photoViews.get(
                editingPhotoIndex
            );


        if (
            view &&
            view.caption
        ) {

            updateCaption(
                photo,
                view.caption
            );

        }

    }
);


/* =========================================================
   ALINHAMENTO
========================================================= */

alignmentButtons.forEach(
    button => {

        button.addEventListener(
            "click",
            function () {

                if (
                    editingPhotoIndex === null
                ) {
                    return;
                }


                const photo =
                    photos[
                        editingPhotoIndex
                    ];


                if (!photo) {
                    return;
                }


                photo.align =
                    this.dataset.align;


                alignmentButtons.forEach(
                    otherButton => {

                        otherButton.classList.toggle(
                            "active",
                            otherButton === this
                        );

                    }
                );


                const view =
                    photoViews.get(
                        editingPhotoIndex
                    );


                if (
                    view &&
                    view.caption
                ) {

                    updateCaption(
                        photo,
                        view.caption
                    );

                }

            }
        );

    }
);


/* =========================================================
   LIMPAR TUDO
========================================================= */

clearAllButton.addEventListener(
    "click",
    function () {

        if (
            photos.length === 0
        ) {
            return;
        }


        const confirmed =
            confirm(
                "Tem certeza que deseja remover todas as fotos?"
            );


        if (!confirmed) {
            return;
        }


        photos.forEach(
            photo => {

                try {

                    URL.revokeObjectURL(
                        photo.url
                    );

                } catch (error) {}

            }
        );


        photos = [];


        photoViews.clear();


        closeSettings();


        renderPhotos();

    }
);


/* =========================================================
   GERAR PDF
========================================================= */

generatePdfButton.addEventListener(
    "click",
    async function () {

        if (
            photos.length === 0
        ) {

            alert(
                "Adicione pelo menos uma foto."
            );

            return;
        }


        if (
            !window.jspdf ||
            !window.jspdf.jsPDF
        ) {

            alert(
                "A biblioteca do PDF não foi carregada. Verifique sua conexão com a internet."
            );

            return;
        }


        const {
            jsPDF
        } = window.jspdf;


        generatePdfButton.disabled =
            true;


        generatePdfButton.textContent =
            "⏳ Gerando PDF...";


        try {

            const pdf =
                new jsPDF({
                    orientation: "portrait",
                    unit: "mm",
                    format: "a4"
                });


            const scaleX =
                PDF_WIDTH_MM /
                PAPER_WIDTH;


            const scaleY =
                PDF_HEIGHT_MM /
                PAPER_HEIGHT;


            for (
                let pageStart = 0;
                pageStart < photos.length;
                pageStart += PHOTOS_PER_PAGE
            ) {

                if (
                    pageStart > 0
                ) {

                    pdf.addPage();

                }


                const pagePhotos =
                    photos.slice(
                        pageStart,
                        pageStart +
                        PHOTOS_PER_PAGE
                    );


                for (
                    let index = 0;
                    index < pagePhotos.length;
                    index++
                ) {

                    const photo =
                        pagePhotos[index];


                    const position =
                        getPolaroidPosition(
                            index
                        );


                    const x =
                        position.left *
                        scaleX;


                    const y =
                        position.top *
                        scaleY;


                    const polaroidWidth =
                        POLAROID_WIDTH *
                        scaleX;


                    const polaroidHeight =
                        POLAROID_HEIGHT *
                        scaleY;


                    /* =====================================
                       FUNDO BRANCO
                    ====================================== */

                    pdf.setFillColor(
                        255,
                        255,
                        255
                    );


                    pdf.rect(
                        x,
                        y,
                        polaroidWidth,
                        polaroidHeight,
                        "F"
                    );


                    /* =====================================
                       FOTO
                    ====================================== */

                    const imageData =
                        await createPhotoCanvas(
                            photo
                        );


                    const photoX =
                        x +
                        PHOTO_MARGIN_X *
                        scaleX;


                    const photoY =
                        y +
                        PHOTO_MARGIN_TOP *
                        scaleY;


                    const photoWidth =
                        PHOTO_WIDTH *
                        scaleX;


                    const photoHeight =
                        PHOTO_HEIGHT *
                        scaleY;


                    pdf.addImage(
                        imageData,
                        "JPEG",
                        photoX,
                        photoY,
                        photoWidth,
                        photoHeight
                    );


                    /* =====================================
                       BORDA DA POLAROID
                    ====================================== */

                    pdf.setDrawColor(
                        215,
                        215,
                        215
                    );


                    pdf.setLineWidth(
                        0.15
                    );


                    pdf.rect(
                        x,
                        y,
                        polaroidWidth,
                        polaroidHeight,
                        "S"
                    );


                    /* =====================================
                       LINHA DE CORTE
                    ====================================== */

                    drawCutLine(
                        pdf,
                        x,
                        y,
                        polaroidWidth,
                        polaroidHeight
                    );


                    /* =====================================
                       LEGENDA
                    ====================================== */

                    drawCaptionPdf(
                        pdf,
                        photo,
                        x,
                        y,
                        polaroidWidth,
                        polaroidHeight,
                        scaleX
                    );

                }

            }


            pdf.save(
                "Polaroids-A4.pdf"
            );

        } catch (error) {

            console.error(
                "Erro ao gerar PDF:",
                error
            );


            alert(
                "Não foi possível gerar o PDF."
            );

        } finally {

            generatePdfButton.disabled =
                false;


            generatePdfButton.textContent =
                "📄 Gerar PDF A4";

        }

    }
);


/* =========================================================
   CANVAS DA FOTO
========================================================= */

function createPhotoCanvas(
    photo
) {

    return new Promise(
        (resolve, reject) => {

            const image =
                new Image();


            image.onload =
                function () {

                    const multiplier =
                        4;


                    const canvas =
                        document.createElement(
                            "canvas"
                        );


                    canvas.width =
                        PHOTO_WIDTH *
                        multiplier;


                    canvas.height =
                        PHOTO_HEIGHT *
                        multiplier;


                    const ctx =
                        canvas.getContext(
                            "2d"
                        );


                    ctx.scale(
                        multiplier,
                        multiplier
                    );


                    /*
                       Recorta exatamente
                       a área da foto.
                    */

                    ctx.save();


                    ctx.beginPath();


                    ctx.rect(
                        0,
                        0,
                        PHOTO_WIDTH,
                        PHOTO_HEIGHT
                    );


                    ctx.clip();


                    /*
                       Rotação.
                    */

                    const centerX =
                        PHOTO_WIDTH / 2;


                    const centerY =
                        PHOTO_HEIGHT / 2;


                    ctx.translate(
                        centerX,
                        centerY
                    );


                    ctx.rotate(
                        photo.rotation *
                        Math.PI /
                        180
                    );


                    const width =
                        photo.baseWidth *
                        photo.scale;


                    const height =
                        photo.baseHeight *
                        photo.scale;


                    /*
                       Como a transformação
                       usa o centro, compensamos.
                    */

                    const drawX =
                        photo.x -
                        centerX;


                    const drawY =
                        photo.y -
                        centerY;


                    ctx.drawImage(
                        image,
                        drawX,
                        drawY,
                        width,
                        height
                    );


                    ctx.restore();


                    resolve(
                        canvas.toDataURL(
                            "image/jpeg",
                            0.95
                        )
                    );

                };


            image.onerror =
                function (error) {

                    reject(error);

                };


            image.src =
                photo.url;

        }
    );
}


/* =========================================================
   LINHA DE CORTE DO PDF
========================================================= */

function drawCutLine(
    pdf,
    x,
    y,
    width,
    height
) {

    pdf.setDrawColor(
        170,
        170,
        170
    );


    pdf.setLineWidth(
        0.12
    );


    if (
        typeof pdf.setLineDashPattern ===
        "function"
    ) {

        pdf.setLineDashPattern(
            [1.2, 1.2],
            0
        );

    }


    pdf.rect(
        x,
        y,
        width,
        height,
        "S"
    );


    if (
        typeof pdf.setLineDashPattern ===
        "function"
    ) {

        pdf.setLineDashPattern(
            [],
            0
        );

    }
}


/* =========================================================
   FONTE PDF
========================================================= */

function getPdfFont(
    fontFamily
) {

    switch (fontFamily) {

        case "Georgia":
        case "Garamond":
        case "Times New Roman":
        case "Palatino Linotype":
        case "Book Antiqua":

            return "times";


        case "Courier New":
        case "Lucida Console":

            return "courier";


        default:

            return "helvetica";

    }
}


/* =========================================================
   LEGENDA NO PDF
========================================================= */

function drawCaptionPdf(
    pdf,
    photo,
    x,
    y,
    width,
    height,
    scaleX
) {

    if (
        !photo.caption ||
        !photo.caption.trim()
    ) {
        return;
    }


    const font =
        getPdfFont(
            photo.fontFamily
        );


    let style =
        "normal";


    if (
        photo.bold &&
        photo.italic
    ) {

        style =
            "bolditalic";

    } else if (
        photo.bold
    ) {

        style =
            "bold";

    } else if (
        photo.italic
    ) {

        style =
            "italic";

    }


    pdf.setFont(
        font,
        style
    );


    /*
       Mantém a legenda proporcional
       ao tamanho escolhido na tela.
    */

    const fontSize =
        Math.max(
            5,
            photo.fontSize * 0.72
        );


    pdf.setFontSize(
        fontSize
    );


    pdf.setTextColor(
        20,
        20,
        20
    );


    /*
       Área de legenda.

       Importante:
       ela fica na parte inferior grande
       da Polaroid.
    */

    const captionX =
        x +
        PHOTO_MARGIN_X *
        scaleX;


    const captionWidth =
        width -
        (PHOTO_MARGIN_X * 2 * scaleX);


    const captionY =
        y +
        height -
        8;


    let align =
        photo.align;


    if (
        align !== "left" &&
        align !== "center" &&
        align !== "right"
    ) {

        align = "center";

    }


    let textX;


    if (
        align === "left"
    ) {

        textX =
            captionX;

    } else if (
        align === "right"
    ) {

        textX =
            captionX +
            captionWidth;

    } else {

        textX =
            captionX +
            captionWidth / 2;

    }


    let text =
        photo.caption.trim();


    /*
       Evita que textos enormes
       saiam da Polaroid.
    */

    const maxCharacters =
        42;


    if (
        text.length >
        maxCharacters
    ) {

        text =
            text.substring(
                0,
                maxCharacters - 3
            ) +
            "...";

    }


    pdf.text(
        text,
        textX,
        captionY,
        {
            align: align
        }
    );
}


/* =========================================================
   INICIALIZAÇÃO
========================================================= */

renderPhotos();