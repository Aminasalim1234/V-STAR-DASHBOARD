/* =========================================================
   VSTAR DASHBOARD
   Complete Updated JavaScript
   ========================================================= */

let allReviews = [];
let filteredReviews = [];


/* =========================================================
   LOAD REVIEWS
   ========================================================= */

async function loadReviews() {

    try {

        const response = await fetch(
            "/api/reviews?refresh=" + Date.now()
        );

        if (!response.ok) {
            throw new Error("Failed to load reviews");
        }

        const data = await response.json();

        allReviews = data.reviews || [];

        populateStoreFilter();

        updateOverview();

        applyFilters();

        updateStores();

        updateLastRefresh();

    } catch (error) {

        console.error(
            "Review loading error:",
            error
        );

        const table =
            document.getElementById("reviewTable");

        if (table) {

            table.innerHTML = `
                <tr>
                    <td
                        colspan="6"
                        class="empty-state">
                        Unable to load reviews.
                    </td>
                </tr>
            `;
        }
    }
}


/* =========================================================
   OVERVIEW KPI
   ========================================================= */

function updateOverview() {

    const total =
        allReviews.length;


    const positive =
        allReviews.filter(
            review =>
                normalize(review.sentiment) ===
                "positive"
        ).length;


    const negative =
        allReviews.filter(
            review =>
                normalize(review.sentiment) ===
                "negative"
        ).length;


    const pending =
        allReviews.filter(review => {

            const status =
                normalize(review.reply_status);

            return (
                status === "pending" ||
                status === "ready to post" ||
                status === "review required"
            );

        }).length;


    const posted =
        allReviews.filter(
            review =>
                normalize(review.reply_status) ===
                "posted"
        ).length;


    const ratings =
        allReviews
            .map(review => Number(review.rating))
            .filter(
                rating =>
                    rating >= 1 &&
                    rating <= 5
            );


    const average =
        ratings.length
            ? ratings.reduce(
                (a, b) => a + b,
                0
            ) / ratings.length
            : 0;


    document.getElementById(
        "totalReviews"
    ).textContent = total;


    document.getElementById(
        "averageRating"
    ).textContent =
        average
            ? average.toFixed(1)
            : "0.0";


    document.getElementById(
        "positiveReviews"
    ).textContent = positive;


    document.getElementById(
        "negativeReviews"
    ).textContent = negative;


    document.getElementById(
        "pendingReviews"
    ).textContent = pending;


    document.getElementById(
        "postedReviews"
    ).textContent = posted;


    updateAverageStars(average);
}


/* =========================================================
   AVERAGE STARS
   ========================================================= */

function updateAverageStars(rating) {

    const container =
        document.getElementById(
            "averageStars"
        );


    const rounded =
        Math.round(rating);


    let output = "";


    for (let i = 1; i <= 5; i++) {

        output +=
            i <= rounded
                ? "★ "
                : "☆ ";
    }


    container.textContent =
        output.trim();
}


/* =========================================================
   STORE FILTER
   ========================================================= */

function populateStoreFilter() {

    const select =
        document.getElementById(
            "storeFilter"
        );


    const stores = [
        ...new Set(
            allReviews
                .map(
                    review =>
                        review.store_name
                )
                .filter(Boolean)
        )
    ].sort();


    select.innerHTML = `
        <option value="all">
            All EBOs / Stores
        </option>
    `;


    stores.forEach(store => {

        const option =
            document.createElement(
                "option"
            );


        option.value =
            store;


        option.textContent =
            store;


        select.appendChild(
            option
        );
    });
}


/* =========================================================
   APPLY ALL FILTERS
   ========================================================= */

function applyFilters() {

    const store =
        document.getElementById(
            "storeFilter"
        ).value;


    const sentiment =
        document.getElementById(
            "sentimentFilter"
        ).value;


    const rating =
        document.getElementById(
            "ratingFilter"
        ).value;


    filteredReviews =
        allReviews.filter(review => {


            /* STORE */

            const storeMatch =
                store === "all" ||
                review.store_name === store;


            /* SENTIMENT */

            const sentimentMatch =
                sentiment === "all" ||
                normalize(
                    review.sentiment
                ) ===
                normalize(sentiment);


            /* RATING */

            const ratingMatch =
                rating === "all" ||
                Number(review.rating) ===
                Number(rating);


            return (
                storeMatch &&
                sentimentMatch &&
                ratingMatch
            );
        });


    /*
       The SAME filtered review set
       updates all Analytics sections.
    */

    updateSentiment(
        filteredReviews
    );


    updateRatingChart(
        filteredReviews
    );


    updateReviewTable(
        filteredReviews
    );


    updateFilterLabels(
        store,
        sentiment,
        rating
    );
}


/* =========================================================
   CLEAR FILTERS
   ========================================================= */

function clearFilters() {

    document.getElementById(
        "storeFilter"
    ).value = "all";


    document.getElementById(
        "sentimentFilter"
    ).value = "all";


    document.getElementById(
        "ratingFilter"
    ).value = "all";


    applyFilters();
}


/* =========================================================
   SENTIMENT DONUT
   ========================================================= */

function updateSentiment(reviews) {

    const total =
        reviews.length;


    const positive =
        reviews.filter(
            review =>
                normalize(review.sentiment) ===
                "positive"
        ).length;


    const neutral =
        reviews.filter(
            review =>
                normalize(review.sentiment) ===
                "neutral"
        ).length;


    const negative =
        reviews.filter(
            review =>
                normalize(review.sentiment) ===
                "negative"
        ).length;


    const ratingOnly =
        reviews.filter(
            review =>
                normalize(review.sentiment) ===
                "rating only"
        ).length;


    /* ================= PERCENTAGES ================= */

    const positivePct =
        total
            ? (positive / total) * 100
            : 0;


    const neutralPct =
        total
            ? (neutral / total) * 100
            : 0;


    const negativePct =
        total
            ? (negative / total) * 100
            : 0;


    const ratingOnlyPct =
        total
            ? (ratingOnly / total) * 100
            : 0;


    /* ================= DISPLAY ================= */

    document.getElementById(
        "sentimentTotal"
    ).textContent = total;


    document.getElementById(
        "positiveLegend"
    ).textContent =
        formatPercent(positivePct);


    document.getElementById(
        "neutralLegend"
    ).textContent =
        formatPercent(neutralPct);


    document.getElementById(
        "negativeLegend"
    ).textContent =
        formatPercent(negativePct);


    document.getElementById(
        "ratingOnlyLegend"
    ).textContent =
        formatPercent(ratingOnlyPct);


    const donut =
        document.getElementById(
            "sentimentDonut"
        );


    /* ================= EMPTY ================= */

    if (total === 0) {

        donut.style.background =
            "#eeeeee";

        return;
    }


    /*
       Convert each percentage into
       degrees.

       Positive     = green
       Neutral      = yellow
       Negative     = red
       Rating Only  = grey

       All four together = 100%.
    */

    const positiveEnd =
        positivePct * 3.6;


    const neutralEnd =
        positiveEnd +
        (neutralPct * 3.6);


    const negativeEnd =
        neutralEnd +
        (negativePct * 3.6);


    donut.style.background = `
        conic-gradient(
            #31a866
            0deg
            ${positiveEnd}deg,

            #e0a326
            ${positiveEnd}deg
            ${neutralEnd}deg,

            #d71920
            ${neutralEnd}deg
            ${negativeEnd}deg,

            #b8b8b8
            ${negativeEnd}deg
            360deg
        )
    `;
}


/* =========================================================
   RATING DISTRIBUTION
   ========================================================= */

function updateRatingChart(reviews) {

    const chart =
        document.getElementById(
            "ratingChart"
        );


    const counts = {
        5: 0,
        4: 0,
        3: 0,
        2: 0,
        1: 0
    };


    reviews.forEach(review => {

        const rating =
            Number(review.rating);


        if (
            rating >= 1 &&
            rating <= 5
        ) {

            counts[rating]++;
        }
    });


    const max =
        Math.max(
            ...Object.values(counts),
            1
        );


    chart.innerHTML = "";


    [5, 4, 3, 2, 1]
        .forEach(rating => {


            const count =
                counts[rating];


            const width =
                (count / max) * 100;


            chart.innerHTML += `

                <div class="rating-row">

                    <div class="rating-label">
                        ${rating} ★
                    </div>

                    <div class="rating-track">

                        <div
                            class="rating-fill"
                            style="width: ${width}%">
                        </div>

                    </div>

                    <div class="rating-count">
                        ${count}
                    </div>

                </div>
            `;
        });
}


/* =========================================================
   CUSTOMER REVIEWS
   ========================================================= */

function updateReviewTable(reviews) {

    const table =
        document.getElementById(
            "reviewTable"
        );


    document.getElementById(
        "reviewCountText"
    ).textContent =
        `Showing ${reviews.length} review${
            reviews.length === 1
                ? ""
                : "s"
        }`;


    if (!reviews.length) {

        table.innerHTML = `
            <tr>

                <td
                    colspan="6"
                    class="empty-state">

                    No reviews match the
                    selected filters.

                </td>

            </tr>
        `;

        return;
    }


    table.innerHTML =
        reviews
            .map(review => {


                const sentiment =
                    review.sentiment ||
                    "—";


                const status =
                    review.reply_status ||
                    "—";


                const reviewReply =
                    review.suggested_reply ||
                    "—";


                return `

                    <tr>


                        <!-- CUSTOMER -->

                        <td>

                            <span
                                class="customer-name">

                                ${escapeHtml(
                                    review.reviewer_name ||
                                    "Unknown"
                                )}

                            </span>

                        </td>


                        <!-- RATING -->

                        <td>

                            <span
                                class="review-rating">

                                ${ratingStars(
                                    review.rating
                                )}

                            </span>

                        </td>


                        <!-- REVIEW -->

                        <td>

                            <div
                                class="review-text">

                                ${escapeHtml(
                                    review.review_text ||
                                    "Rating only"
                                )}

                            </div>

                        </td>


                        <!-- SENTIMENT -->

                        <td>

                            ${sentimentBadge(
                                sentiment
                            )}

                        </td>


                        <!-- REPLY STATUS -->

                        <td>

                            ${statusBadge(
                                status
                            )}

                        </td>


                        <!-- REVIEW REPLY -->

                        <td>

                            <div
                                class="review-reply-text">

                                ${escapeHtml(
                                    reviewReply
                                )}

                            </div>

                        </td>


                    </tr>

                `;

            })
            .join("");
}


/* =========================================================
   EBO PERFORMANCE
   ========================================================= */

function updateStores() {

    const table =
        document.getElementById(
            "storeTable"
        );


    const stores = {};


    allReviews.forEach(review => {

        const store =
            review.store_name ||
            "Unknown";


        if (!stores[store]) {

            stores[store] = {

                total: 0,

                ratings: [],

                positive: 0,

                neutral: 0,

                negative: 0
            };
        }


        stores[store].total++;


        const rating =
            Number(review.rating);


        if (
            rating >= 1 &&
            rating <= 5
        ) {

            stores[store]
                .ratings
                .push(rating);
        }


        const sentiment =
            normalize(
                review.sentiment
            );


        if (
            sentiment === "positive"
        ) {

            stores[store]
                .positive++;
        }


        if (
            sentiment === "neutral"
        ) {

            stores[store]
                .neutral++;
        }


        if (
            sentiment === "negative"
        ) {

            stores[store]
                .negative++;
        }

    });


    table.innerHTML =
        Object.entries(stores)
            .map(
                ([store, data]) => {


                    const average =
                        data.ratings.length
                            ? data.ratings.reduce(
                                (a, b) =>
                                    a + b,
                                0
                              ) /
                              data.ratings.length
                            : 0;


                    return `

                        <tr>

                            <td>

                                <strong>
                                    ${escapeHtml(
                                        store
                                    )}
                                </strong>

                            </td>

                            <td>
                                ${data.total}
                            </td>

                            <td>

                                ${
                                    average
                                        ? average.toFixed(1)
                                        : "—"
                                }

                            </td>

                            <td>
                                ${data.positive}
                            </td>

                            <td>
                                ${data.neutral}
                            </td>

                            <td>
                                ${data.negative}
                            </td>

                        </tr>

                    `;
                }
            )
            .join("");


    if (
        !Object.keys(stores).length
    ) {

        table.innerHTML = `
            <tr>

                <td
                    colspan="6"
                    class="empty-state">

                    No store data available.

                </td>

            </tr>
        `;
    }
}


/* =========================================================
   FILTER LABELS
   ========================================================= */

function updateFilterLabels(
    store,
    sentiment,
    rating
) {

    const parts = [];


    if (store !== "all") {
        parts.push(store);
    }


    if (sentiment !== "all") {
        parts.push(sentiment);
    }


    if (rating !== "all") {
        parts.push(`${rating}★`);
    }


    const label =
        parts.length
            ? parts.join(" · ")
            : "All EBOs / Stores";


    document.getElementById(
        "sentimentScope"
    ).textContent = label;


    document.getElementById(
        "ratingScope"
    ).textContent = label;
}


/* =========================================================
   FULLSCREEN
   ========================================================= */

function toggleFullscreen(id) {

    const card =
        document.getElementById(id);


    card.classList.toggle(
        "fullscreen"
    );


    document.body.classList.toggle(
        "fullscreen-open",
        card.classList.contains(
            "fullscreen"
        )
    );
}


/* =========================================================
   PROFILE MENU
   ========================================================= */

function toggleProfileMenu() {

    const menu =
        document.getElementById(
            "profileMenu"
        );


    menu.classList.toggle(
        "show"
    );
}


document.addEventListener(
    "click",
    function(event) {

        const wrapper =
            document.querySelector(
                ".profile-wrapper"
            );


        const menu =
            document.getElementById(
                "profileMenu"
            );


        if (
            wrapper &&
            !wrapper.contains(
                event.target
            )
        ) {

            menu.classList.remove(
                "show"
            );
        }
    }
);


/* =========================================================
   SIDEBAR NAVIGATION
   ========================================================= */

document.querySelectorAll(
    ".nav-link"
).forEach(link => {


    link.addEventListener(
        "click",
        function(event) {


            const href =
                this.getAttribute(
                    "href"
                );


            /*
               Settings currently has
               href="#", so don't process it.
            */

            if (
                !href ||
                href === "#"
            ) {

                return;
            }


            document
                .querySelectorAll(
                    ".nav-link"
                )
                .forEach(item => {

                    item.classList.remove(
                        "active"
                    );

                });


            this.classList.add(
                "active"
            );


            const target =
                document.querySelector(
                    href
                );


            if (target) {

                target.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
            }


            const name =
                this.querySelector(
                    "span:last-child"
                );


            if (name) {

                document.getElementById(
                    "breadcrumbName"
                ).textContent =
                    name.textContent.trim();
            }

        }
    );
});


/* =========================================================
   AUTOMATIC SIDEBAR ACTIVE STATE
   ========================================================= */

const sections = [

    document.getElementById(
        "overview"
    ),

    document.getElementById(
        "analytics"
    ),

    document.getElementById(
        "stores"
    )
];


window.addEventListener(
    "scroll",
    function() {


        let current =
            "overview";


        sections.forEach(
            section => {


                if (!section) {
                    return;
                }


                const sectionTop =
                    section
                        .getBoundingClientRect()
                        .top;


                if (
                    sectionTop <= 150
                ) {

                    current =
                        section.id;
                }

            }
        );


        document
            .querySelectorAll(
                ".nav-link"
            )
            .forEach(link => {


                link.classList.remove(
                    "active"
                );


                if (
                    link.getAttribute(
                        "href"
                    ) ===
                    `#${current}`
                ) {

                    link.classList.add(
                        "active"
                    );


                    const name =
                        link.querySelector(
                            "span:last-child"
                        );


                    if (name) {

                        document.getElementById(
                            "breadcrumbName"
                        ).textContent =
                            name.textContent.trim();
                    }
                }

            });
    }
);


/* =========================================================
   ESC KEY - EXIT FULLSCREEN
   ========================================================= */

document.addEventListener(
    "keydown",
    function(event) {


        if (
            event.key !== "Escape"
        ) {

            return;
        }


        const card =
            document.querySelector(
                ".analytics-master.fullscreen"
            );


        if (card) {

            card.classList.remove(
                "fullscreen"
            );


            document.body.classList.remove(
                "fullscreen-open"
            );
        }
    }
);


/* =========================================================
   HELPERS
   ========================================================= */

function normalize(value) {

    return String(
        value || ""
    )
        .trim()
        .toLowerCase();
}


function formatPercent(value) {

    if (!value) {
        return "0%";
    }


    return value.toFixed(1) + "%";
}


function ratingStars(rating) {

    const value =
        Number(rating);


    if (
        !value ||
        value < 1 ||
        value > 5
    ) {

        return "—";
    }


    return "★".repeat(value);
}


function sentimentBadge(
    sentiment
) {

    const normalized =
        normalize(sentiment);


    if (
        normalized ===
        "positive"
    ) {

        return `
            <span class="badge badge-positive">
                Positive
            </span>
        `;
    }


    if (
        normalized ===
        "negative"
    ) {

        return `
            <span class="badge badge-negative">
                Negative
            </span>
        `;
    }


    if (
        normalized ===
        "neutral"
    ) {

        return `
            <span class="badge badge-neutral">
                Neutral
            </span>
        `;
    }


    return `
        <span class="badge badge-other">
            ${escapeHtml(sentiment)}
        </span>
    `;
}


function statusBadge(status) {

    const normalized =
        normalize(status);


    if (
        normalized ===
        "posted"
    ) {

        return `
            <span class="badge badge-posted">
                Posted
            </span>
        `;
    }


    if (
        normalized === "pending" ||
        normalized === "ready to post" ||
        normalized === "review required"
    ) {

        return `
            <span class="badge badge-pending">
                ${escapeHtml(status)}
            </span>
        `;
    }


    return `
        <span class="badge badge-other">
            ${escapeHtml(status)}
        </span>
    `;
}


function escapeHtml(value) {

    return String(value)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );
}


function updateLastRefresh() {

    const now =
        new Date();


    document.getElementById(
        "lastRefresh"
    ).textContent =
        "Updated " +
        now.toLocaleTimeString(
            [],
            {
                hour: "2-digit",
                minute: "2-digit"
            }
        );
}


/* =========================================================
   START
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        loadReviews();

    }
);